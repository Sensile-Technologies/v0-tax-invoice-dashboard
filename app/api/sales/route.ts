import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { syncStockWithKRA } from "@/lib/kra-stock-service"
import { callKraSaveSales } from "@/lib/kra-sales-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')
    const shiftId = searchParams.get('shift_id')
    const nozzleId = searchParams.get('nozzle_id')
    const date = searchParams.get('date')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const exportAll = searchParams.get('export') === 'true'

    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (branchId) {
      whereClause += ` AND branch_id = $${paramIndex}`
      params.push(branchId)
      paramIndex++
    }

    if (shiftId) {
      whereClause += ` AND shift_id = $${paramIndex}`
      params.push(shiftId)
      paramIndex++
    }

    if (nozzleId) {
      whereClause += ` AND nozzle_id = $${paramIndex}`
      params.push(nozzleId)
      paramIndex++
    }

    if (date) {
      whereClause += ` AND DATE(sale_date) = $${paramIndex}`
      params.push(date)
      paramIndex++
    }

    if (dateFrom) {
      whereClause += ` AND DATE(sale_date) >= $${paramIndex}`
      params.push(dateFrom)
      paramIndex++
    }

    if (dateTo) {
      whereClause += ` AND DATE(sale_date) <= $${paramIndex}`
      params.push(dateTo)
      paramIndex++
    }

    // Filter by automated sales
    const isAutomated = searchParams.get('is_automated')
    if (isAutomated === 'true') {
      whereClause += ` AND is_automated = true`
    } else if (isAutomated === 'false') {
      whereClause += ` AND (is_automated = false OR is_automated IS NULL)`
    }

    // Filter by transmission status
    const transmissionStatus = searchParams.get('transmission_status')
    if (transmissionStatus && transmissionStatus !== 'all') {
      whereClause += ` AND transmission_status = $${paramIndex}`
      params.push(transmissionStatus)
      paramIndex++
    }

    // Date range for automated sales (start_date and end_date)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    if (startDate) {
      whereClause += ` AND DATE(sale_date) >= $${paramIndex}`
      params.push(startDate)
      paramIndex++
    }
    if (endDate) {
      whereClause += ` AND DATE(sale_date) <= $${paramIndex}`
      params.push(endDate)
      paramIndex++
    }

    const countResult = await query(`SELECT COUNT(*) as count FROM sales ${whereClause}`, params)
    const totalCount = parseInt(countResult[0]?.count || '0')

    let sql = `SELECT * FROM sales ${whereClause} ORDER BY sale_date DESC`
    
    if (!exportAll) {
      const offset = (page - 1) * limit
      sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
      params.push(limit, offset)
    }

    const result = await query(sql, params)

    return NextResponse.json({
      success: true,
      sales: result,
      data: result,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    })

  } catch (error: any) {
    console.error("Error fetching sales:", error)
    return NextResponse.json(
      { error: "Failed to fetch sales", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      branch_id,
      shift_id,
      nozzle_id,
      fuel_type,
      quantity,
      unit_price,
      total_amount,
      payment_method,
      customer_name,
      vehicle_number,
      customer_pin,
      invoice_number,
      meter_reading_after,
      transmission_status,
      receipt_number,
      is_loyalty_sale,
      loyalty_customer_name,
      loyalty_customer_pin,
      staff_id,
      sync_to_kra = true,
      deduct_from_tank = true
    } = body

    if (!branch_id || !nozzle_id || !fuel_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO sales (
        branch_id, shift_id, nozzle_id, fuel_type, quantity, unit_price, 
        total_amount, payment_method, customer_name, vehicle_number, customer_pin,
        invoice_number, meter_reading_after, transmission_status, receipt_number,
        is_loyalty_sale, loyalty_customer_name, loyalty_customer_pin, staff_id, sale_date, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW())
      RETURNING *`,
      [
        branch_id, shift_id, nozzle_id, fuel_type, quantity, unit_price,
        total_amount, payment_method, customer_name, vehicle_number, customer_pin,
        invoice_number, meter_reading_after, transmission_status || 'pending', receipt_number,
        is_loyalty_sale || false, loyalty_customer_name, loyalty_customer_pin, staff_id || null
      ]
    )

    const sale = result[0]
    let kraResult = null
    let tankUpdate = null

    if (quantity && quantity > 0) {
      const tankResult = await query(
        `SELECT * FROM tanks WHERE branch_id = $1 AND fuel_type ILIKE $2 AND status = 'active' ORDER BY current_stock DESC LIMIT 1`,
        [branch_id, `%${fuel_type}%`]
      )

      if (tankResult.length > 0) {
        const tank = tankResult[0]
        
        if (!tank.kra_item_cd) {
          return NextResponse.json(
            { error: `Tank "${tank.tank_name}" is not mapped to an item. Please map the tank to an item in the item list before selling.` },
            { status: 400 }
          )
        }
        const previousStock = tank.current_stock || 0
        const newStock = Math.max(0, previousStock - quantity)

        if (deduct_from_tank) {
          await query(
            `UPDATE tanks SET current_stock = $1, updated_at = NOW() WHERE id = $2`,
            [newStock, tank.id]
          )

          tankUpdate = {
            tankId: tank.id,
            tankName: tank.tank_name,
            previousStock,
            newStock,
            quantityDeducted: quantity
          }
        }

        if (sync_to_kra) {
          console.log(`[Sales API] Syncing sale of ${quantity} ${fuel_type} to KRA for branch ${branch_id}`)
          
          // Use loyalty customer PIN for KRA when it's a loyalty sale
          const effectiveCustomerPin = (is_loyalty_sale && loyalty_customer_pin) 
            ? loyalty_customer_pin 
            : (customer_pin || '')
          const effectiveCustomerName = (is_loyalty_sale && loyalty_customer_name)
            ? loyalty_customer_name
            : (customer_name || 'Walk-in Customer')
          
          kraResult = await callKraSaveSales({
            branch_id,
            invoice_number: invoice_number || `INV-${Date.now().toString(36).toUpperCase()}`,
            receipt_number: receipt_number || `RCP-${Date.now().toString(36).toUpperCase()}`,
            fuel_type,
            quantity,
            unit_price: unit_price || 0,
            total_amount: total_amount || (quantity * (unit_price || 0)),
            payment_method: payment_method || 'cash',
            customer_name: effectiveCustomerName,
            customer_pin: effectiveCustomerPin,
            sale_date: new Date().toISOString(),
            tank_id: tank.id
          })

          await query(
            `UPDATE tanks SET kra_sync_status = $1 WHERE id = $2`,
            [kraResult.success ? 'synced' : 'failed', tank.id]
          )

          if (kraResult.success && kraResult.kraResponse?.data) {
            const kraData = kraResult.kraResponse.data
            await query(
              `UPDATE sales SET 
                kra_status = 'success',
                kra_rcpt_sign = $1,
                kra_scu_id = $2,
                kra_cu_inv = $3,
                kra_internal_data = $4,
                transmission_status = 'transmitted'
              WHERE id = $5`,
              [
                kraData.rcptSign || '',
                kraData.sdcId || '',
                `${kraData.sdcId}/${kraData.rcptNo}`,
                kraData.intrlData || '',
                sale.id
              ]
            )
            sale.kra_status = 'success'
            sale.kra_rcpt_sign = kraData.rcptSign
            sale.kra_scu_id = kraData.sdcId
            sale.kra_cu_inv = `${kraData.sdcId}/${kraData.rcptNo}`
            sale.kra_internal_data = kraData.intrlData
          } else if (!kraResult.success) {
            await query(
              `UPDATE sales SET kra_status = 'failed', kra_error = $1 WHERE id = $2`,
              [kraResult.error || 'Unknown error', sale.id]
            )
            sale.kra_status = 'failed'
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: sale,
      tankUpdate,
      kraSync: kraResult ? {
        synced: kraResult.success,
        kraResponse: kraResult.kraResponse,
        error: kraResult.error
      } : null
    })

  } catch (error: any) {
    console.error("Error creating sale:", error)
    return NextResponse.json(
      { error: "Failed to create sale", details: error.message },
      { status: 500 }
    )
  }
}
