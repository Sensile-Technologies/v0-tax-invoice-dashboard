import { NextRequest, NextResponse } from "next/server"
import { query, pool } from "@/lib/db"
import { cookies } from "next/headers"

async function getSessionUser(): Promise<{ id: string; branch_id?: string } | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user_session")
    if (!sessionCookie?.value) return null
    
    const session = JSON.parse(sessionCookie.value)
    return { id: session.id, branch_id: session.branch_id }
  } catch {
    return null
  }
}

async function getUserBranchId(userId: string): Promise<string | null> {
  const staffBranch = await query(
    `SELECT branch_id FROM staff WHERE user_id = $1 LIMIT 1`,
    [userId]
  )
  if (staffBranch && staffBranch.length > 0) {
    return staffBranch[0].branch_id
  }

  const branchUser = await query(
    `SELECT id FROM branches WHERE user_id = $1 LIMIT 1`,
    [userId]
  )
  if (branchUser && branchUser.length > 0) {
    return branchUser[0].id
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    let branchId = searchParams.get("branch_id")

    if (!branchId) {
      branchId = user.branch_id || await getUserBranchId(user.id)
    }

    if (!branchId) {
      return NextResponse.json({ success: false, error: "No branch found for user" }, { status: 403 })
    }

    const orders = await query(
      `SELECT 
        po.*,
        vp.name as supplier_name,
        u.full_name as created_by_name,
        (SELECT COUNT(*) FROM purchase_order_items WHERE purchase_order_id = po.id) as item_count,
        (SELECT COALESCE(SUM(total_amount), 0) FROM purchase_order_items WHERE purchase_order_id = po.id) as total_amount
       FROM purchase_orders po
       LEFT JOIN vendor_partners vp ON po.supplier_id = vp.id
       LEFT JOIN users u ON po.created_by = u.id
       WHERE po.branch_id = $1 AND po.status = 'pending'
       ORDER BY po.issued_at DESC`,
      [branchId]
    )

    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error("Error fetching pending purchase orders:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch purchase orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      purchase_order_id, 
      bowser_volume, 
      dips_mm, 
      acceptance_timestamp,
      tank_readings,
      dispenser_readings,
      remarks 
    } = body

    if (!purchase_order_id) {
      return NextResponse.json({ success: false, error: "Purchase order ID is required" }, { status: 400 })
    }

    if (bowser_volume === undefined || bowser_volume === null) {
      return NextResponse.json({ success: false, error: "Bowser volume is required" }, { status: 400 })
    }

    const order = await query(
      `SELECT po.*, b.id as branch_id FROM purchase_orders po 
       JOIN branches b ON po.branch_id = b.id
       WHERE po.id = $1 AND po.status = 'pending'`,
      [purchase_order_id]
    )

    if (!order || order.length === 0) {
      return NextResponse.json({ success: false, error: "Purchase order not found or already accepted" }, { status: 404 })
    }

    const branchId = order[0].branch_id

    let totalTankVariance = 0
    let totalDispenserVariance = 0

    if (tank_readings && Array.isArray(tank_readings)) {
      for (const reading of tank_readings) {
        const tankDiff = (parseFloat(reading.volume_after) || 0) - (parseFloat(reading.volume_before) || 0)
        totalTankVariance += tankDiff
      }
    }

    if (dispenser_readings && Array.isArray(dispenser_readings)) {
      for (const reading of dispenser_readings) {
        const dispenserDiff = (parseFloat(reading.meter_reading_after) || 0) - (parseFloat(reading.meter_reading_before) || 0)
        totalDispenserVariance += dispenserDiff
      }
    }

    const bowserVol = parseFloat(bowser_volume) || 0
    const totalVariance = (totalTankVariance + totalDispenserVariance) - bowserVol

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const acceptanceResult = await client.query(
        `INSERT INTO purchase_order_acceptances 
         (purchase_order_id, branch_id, accepted_by, bowser_volume, dips_mm, total_variance, remarks, acceptance_timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          purchase_order_id, 
          branchId, 
          user.id, 
          bowserVol, 
          dips_mm || null, 
          totalVariance,
          remarks || null,
          acceptance_timestamp || new Date().toISOString()
        ]
      )

      const acceptanceId = acceptanceResult.rows[0].id

      if (tank_readings && Array.isArray(tank_readings)) {
        for (const reading of tank_readings) {
          await client.query(
            `INSERT INTO po_acceptance_tank_readings 
             (acceptance_id, tank_id, volume_before, volume_after)
             VALUES ($1, $2, $3, $4)`,
            [acceptanceId, reading.tank_id, reading.volume_before, reading.volume_after]
          )
        }
      }

      if (dispenser_readings && Array.isArray(dispenser_readings)) {
        for (const reading of dispenser_readings) {
          await client.query(
            `INSERT INTO po_acceptance_dispenser_readings 
             (acceptance_id, dispenser_id, meter_reading_before, meter_reading_after)
             VALUES ($1, $2, $3, $4)`,
            [acceptanceId, reading.dispenser_id, reading.meter_reading_before, reading.meter_reading_after]
          )
        }
      }

      await client.query(
        `UPDATE purchase_orders SET status = 'accepted', accepted_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [purchase_order_id]
      )

      await client.query('COMMIT')

      return NextResponse.json({ 
        success: true, 
        data: {
          acceptance: acceptanceResult.rows[0],
          variance: totalVariance,
          tank_variance: totalTankVariance,
          dispenser_variance: totalDispenserVariance
        },
        message: "Purchase order accepted successfully" 
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error accepting purchase order:", error)
    return NextResponse.json({ success: false, error: "Failed to accept purchase order" }, { status: 500 })
  }
}
