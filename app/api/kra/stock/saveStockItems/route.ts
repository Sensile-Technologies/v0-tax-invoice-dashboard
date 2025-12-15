import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { 
  syncStockWithKRA, 
  StockMovementType
} from "@/lib/kra-stock-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      branchId, 
      movementType, 
      items,
      customerId,
      customerName,
      customerBhfId,
      remark 
    } = body

    if (!branchId) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        { status: 400 }
      )
    }

    if (!movementType || !["initial_stock", "stock_receive", "stock_adjustment", "stock_transfer", "sale"].includes(movementType)) {
      return NextResponse.json(
        { error: "Valid movement type is required (initial_stock, stock_receive, stock_adjustment, stock_transfer, sale)" },
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 }
      )
    }

    for (const item of items) {
      if (!item.tankId || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return NextResponse.json(
          { error: "Each item must have tankId and positive quantity" },
          { status: 400 }
        )
      }
    }

    const branchResult = await query(`
      SELECT id, name, kra_pin, bhf_id, vendor_id FROM branches WHERE id = $1
    `, [branchId])

    if (branchResult.length === 0) {
      return NextResponse.json(
        { error: "Branch not found" },
        { status: 404 }
      )
    }

    const result = await syncStockWithKRA(
      branchId,
      movementType as StockMovementType,
      items.map((item: any) => ({
        tankId: item.tankId,
        quantity: item.quantity,
        unitPrice: item.unitPrice || 0,
        itemCode: item.itemCode,
        itemClassCode: item.itemClassCode,
        itemName: item.itemName
      })),
      {
        customerId,
        customerName,
        customerBhfId,
        remark
      }
    )


    return NextResponse.json({
      success: result.success,
      movementId: result.movementId,
      kraResponse: result.kraResponse,
      message: result.success 
        ? "Stock movement successfully synced with KRA" 
        : result.error || "KRA sync failed"
    })

  } catch (error: any) {
    console.error("[KRA Stock API] Error:", error)
    return NextResponse.json(
      { error: "Failed to process stock movement", details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const branchId = searchParams.get("branch_id")
    const limit = parseInt(searchParams.get("limit") || "50")

    let sql = `
      SELECT sm.*, b.name as branch_name
      FROM stock_movements sm
      JOIN branches b ON b.id = sm.branch_id
    `
    const params: any[] = []
    let paramIndex = 1

    if (branchId) {
      sql += ` WHERE sm.branch_id = $${paramIndex}`
      params.push(branchId)
      paramIndex++
    }

    sql += ` ORDER BY sm.created_at DESC LIMIT $${paramIndex}`
    params.push(limit)

    const movements = await query(sql, params)

    return NextResponse.json({ movements })

  } catch (error: any) {
    console.error("[KRA Stock API] Error fetching movements:", error)
    return NextResponse.json(
      { error: "Failed to fetch stock movements", details: error.message },
      { status: 500 }
    )
  }
}
