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

    const branchId = user.branch_id || await getUserBranchId(user.id)

    if (!branchId) {
      return NextResponse.json({ success: false, error: "No branch found for user" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const purchaseOrderId = searchParams.get("purchase_order_id")

    if (purchaseOrderId) {
      const poCheck = await query(
        `SELECT id FROM purchase_orders WHERE id = $1 AND branch_id = $2`,
        [purchaseOrderId, branchId]
      )
      if (!poCheck || poCheck.length === 0) {
        return NextResponse.json({ success: false, error: "Purchase order not found" }, { status: 404 })
      }

      const poItems = await query(
        `SELECT poi.item_id, poi.quantity, poi.unit_price, poi.total_amount,
                i.item_name, i.quantity_unit
         FROM purchase_order_items poi 
         JOIN items i ON poi.item_id = i.id 
         WHERE poi.purchase_order_id = $1`,
        [purchaseOrderId]
      )

      const itemIds = poItems.map((item: any) => item.item_id)

      let tanks: any[] = []
      let dispensers: any[] = []
      let nozzles: any[] = []

      if (itemIds.length > 0) {
        tanks = await query(
          `SELECT t.*, i.item_name 
           FROM tanks t 
           LEFT JOIN items i ON t.item_id = i.id 
           WHERE t.branch_id = $1 AND t.item_id = ANY($2::uuid[])
           ORDER BY t.tank_name`,
          [branchId, itemIds]
        )

        const tankIds = tanks.map((t: any) => t.id)
        
        if (tankIds.length > 0) {
          dispensers = await query(
            `SELECT DISTINCT d.*, t.tank_name,
             COALESCE(
               (SELECT meter_reading_after 
                FROM po_acceptance_dispenser_readings pdr
                JOIN purchase_order_acceptances poa ON pdr.acceptance_id = poa.id
                WHERE pdr.dispenser_id = d.id 
                ORDER BY poa.acceptance_timestamp DESC 
                LIMIT 1),
               0
             ) as last_meter_reading
             FROM dispensers d 
             LEFT JOIN tanks t ON d.tank_id = t.id
             LEFT JOIN dispenser_tanks dt ON d.id = dt.dispenser_id
             WHERE d.branch_id = $1 
               AND (d.tank_id = ANY($2::uuid[]) OR dt.tank_id = ANY($2::uuid[]))
             ORDER BY d.dispenser_number`,
            [branchId, tankIds]
          )
        }
      }

      // Fetch all nozzles for this branch (for multi-nozzle pump readings)
      nozzles = await query(
        `SELECT n.*, d.dispenser_number, i.item_name as fuel_name,
         COALESCE(
           (SELECT meter_reading_after 
            FROM po_acceptance_nozzle_readings pnr
            JOIN purchase_order_acceptances poa ON pnr.acceptance_id = poa.id
            WHERE pnr.nozzle_id = n.id 
            ORDER BY poa.acceptance_timestamp DESC 
            LIMIT 1),
           n.initial_meter_reading,
           0
         ) as last_meter_reading
         FROM nozzles n
         LEFT JOIN dispensers d ON n.dispenser_id = d.id
         LEFT JOIN items i ON n.item_id = i.id
         WHERE n.branch_id = $1 AND n.status = 'active'
         ORDER BY d.dispenser_number, n.nozzle_number`,
        [branchId]
      )

      return NextResponse.json({ 
        success: true, 
        tanks,
        dispensers,
        nozzles,
        items: poItems
      })
    }

    const orders = await query(
      `SELECT 
        po.*,
        vp.name as supplier_name,
        tp.name as transporter_name,
        u.username as created_by_name,
        (SELECT COUNT(*) FROM purchase_order_items WHERE purchase_order_id = po.id) as item_count,
        (SELECT COALESCE(SUM(total_amount), 0) FROM purchase_order_items WHERE purchase_order_id = po.id) as total_amount
       FROM purchase_orders po
       LEFT JOIN vendor_partners vp ON po.supplier_id = vp.id
       LEFT JOIN vendor_partners tp ON po.transporter_id = tp.id
       LEFT JOIN users u ON po.created_by = u.id
       WHERE po.branch_id = $1 AND po.status = 'pending' AND po.approval_status = 'approved'
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

    const userBranchId = user.branch_id || await getUserBranchId(user.id)
    if (!userBranchId) {
      return NextResponse.json({ success: false, error: "No branch found for user" }, { status: 403 })
    }

    const body = await request.json()
    const { 
      purchase_order_id, 
      bowser_volume, 
      dips_mm, 
      acceptance_timestamp,
      tank_readings,
      dispenser_readings,
      nozzle_readings,
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
       WHERE po.id = $1 AND po.status = 'pending' AND po.branch_id = $2`,
      [purchase_order_id, userBranchId]
    )

    if (!order || order.length === 0) {
      return NextResponse.json({ success: false, error: "Purchase order not found or not assigned to your branch" }, { status: 404 })
    }

    const branchId = order[0].branch_id

    // Validate tank capacity before processing
    if (tank_readings && Array.isArray(tank_readings)) {
      for (const reading of tank_readings) {
        const tankResult = await query(
          `SELECT tank_name, capacity FROM tanks WHERE id = $1`,
          [reading.tank_id]
        )
        if (tankResult && tankResult.length > 0) {
          const tank = tankResult[0]
          const volumeAfter = parseFloat(reading.volume_after) || 0
          const capacity = parseFloat(tank.capacity) || 0
          if (capacity > 0 && volumeAfter > capacity) {
            return NextResponse.json({ 
              success: false, 
              error: `${tank.tank_name}: Volume after (${volumeAfter}L) exceeds tank capacity (${capacity}L)` 
            }, { status: 400 })
          }
        }
      }
    }

    let totalTankVariance = 0
    let totalDispenserVariance = 0
    let totalNozzleVariance = 0

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

    if (nozzle_readings && Array.isArray(nozzle_readings)) {
      for (const reading of nozzle_readings) {
        const nozzleDiff = (parseFloat(reading.meter_reading_after) || 0) - (parseFloat(reading.meter_reading_before) || 0)
        totalNozzleVariance += nozzleDiff
      }
    }

    const bowserVol = parseFloat(bowser_volume) || 0
    // Nozzle readings replace dispenser readings in variance calculation if provided
    const meterVariance = nozzle_readings && nozzle_readings.length > 0 ? totalNozzleVariance : totalDispenserVariance
    const totalVariance = (totalTankVariance + meterVariance) - bowserVol

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
          const volumeBefore = parseFloat(reading.volume_before) || 0
          const volumeAfter = parseFloat(reading.volume_after) || 0
          const quantityReceived = volumeAfter - volumeBefore

          await client.query(
            `INSERT INTO po_acceptance_tank_readings 
             (acceptance_id, tank_id, volume_before, volume_after)
             VALUES ($1, $2, $3, $4)`,
            [acceptanceId, reading.tank_id, volumeBefore, volumeAfter]
          )
          
          await client.query(
            `UPDATE tanks 
             SET current_stock = $1, updated_at = NOW()
             WHERE id = $2 AND branch_id = $3`,
            [volumeAfter, reading.tank_id, branchId]
          )

          // Insert stock_adjustments record for stock in history
          if (quantityReceived > 0) {
            await client.query(
              `INSERT INTO stock_adjustments 
               (branch_id, tank_id, adjustment_type, quantity, previous_stock, new_stock, reason, approved_by, approval_status)
               VALUES ($1, $2, 'purchase_receive', $3, $4, $5, $6, $7, 'approved')`,
              [branchId, reading.tank_id, quantityReceived, volumeBefore, volumeAfter, 
               `Purchase order delivery accepted (PO: ${purchase_order_id.substring(0, 8)})`, user.id]
            )
          }
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

      // Save nozzle-level readings (for multi-nozzle pumps)
      if (nozzle_readings && Array.isArray(nozzle_readings)) {
        for (const reading of nozzle_readings) {
          await client.query(
            `INSERT INTO po_acceptance_nozzle_readings 
             (acceptance_id, nozzle_id, meter_reading_before, meter_reading_after)
             VALUES ($1, $2, $3, $4)`,
            [acceptanceId, reading.nozzle_id, reading.meter_reading_before, reading.meter_reading_after]
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
          dispenser_variance: totalDispenserVariance,
          nozzle_variance: totalNozzleVariance
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
