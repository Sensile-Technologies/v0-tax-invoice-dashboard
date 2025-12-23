import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { callKraSaveSales } from "@/lib/kra-sales-api"

interface FuelGradeMapping {
  id: string
  pts_id: string | null
  fuel_grade_id: number
  fuel_grade_name: string
  item_id: string
  item_name: string
  item_code: string
  sale_price: number
  branch_id: string
}

interface PumpTransactionPacket {
  Id: number
  Type: string
  Data: {
    DateTimeStart: string
    DateTime: string
    Pump: number
    Nozzle: number
    FuelGradeId: number
    FuelGradeName: string
    Transaction: number
    Volume: number
    TCVolume: number
    Price: number
    Amount: number
    TotalVolume: number
    TotalAmount: number
    Tag: string
    UserId: number
    ConfigurationId: string
  }
}

interface PumpCallbackPayload {
  Protocol: string
  PtsId: string
  Packets: PumpTransactionPacket[]
}

// Helper function to find fuel grade mapping
async function findFuelGradeMapping(ptsId: string, fuelGradeId: number): Promise<FuelGradeMapping | null> {
  try {
    // First try to find a controller-specific mapping
    let result: any = await query(`
      SELECT 
        m.id, m.pts_id, m.fuel_grade_id, m.fuel_grade_name, m.item_id,
        i.item_name, i.item_code, i.sale_price, i.branch_id
      FROM pump_fuel_grade_mappings m
      JOIN items i ON m.item_id = i.id
      WHERE m.pts_id = $1 AND m.fuel_grade_id = $2 AND m.is_active = true AND m.item_id IS NOT NULL
      LIMIT 1
    `, [ptsId, fuelGradeId])
    
    let rows = result.rows || result
    if (rows && rows.length > 0) {
      console.log(`[PUMP CALLBACK] Found controller-specific mapping for fuel grade ${fuelGradeId}`)
      return rows[0]
    }
    
    // Fallback to global mapping (pts_id IS NULL)
    result = await query(`
      SELECT 
        m.id, m.pts_id, m.fuel_grade_id, m.fuel_grade_name, m.item_id,
        i.item_name, i.item_code, i.sale_price, i.branch_id
      FROM pump_fuel_grade_mappings m
      JOIN items i ON m.item_id = i.id
      WHERE m.pts_id IS NULL AND m.fuel_grade_id = $1 AND m.is_active = true AND m.item_id IS NOT NULL
      LIMIT 1
    `, [fuelGradeId])
    
    rows = result.rows || result
    if (rows && rows.length > 0) {
      console.log(`[PUMP CALLBACK] Found global mapping for fuel grade ${fuelGradeId}`)
      return rows[0]
    }
    
    console.log(`[PUMP CALLBACK] No mapping found for fuel grade ${fuelGradeId}`)
    return null
  } catch (error: any) {
    console.error(`[PUMP CALLBACK] Error finding fuel grade mapping:`, error.message)
    return null
  }
}

// Process automatic KRA sale based on pump transaction
async function processAutoKraSale(ptsId: string, data: PumpTransactionPacket['Data'], pumpTxId: string) {
  try {
    console.log(`[PUMP CALLBACK] Checking fuel grade mapping for fuel grade ID: ${data.FuelGradeId}`)
    
    const mapping = await findFuelGradeMapping(ptsId, data.FuelGradeId)
    
    if (!mapping) {
      console.log(`[PUMP CALLBACK] No fuel grade mapping found - skipping KRA sale creation`)
      return
    }
    
    console.log(`[PUMP CALLBACK] Found mapping: ${mapping.fuel_grade_name} -> ${mapping.item_name} (Branch: ${mapping.branch_id})`)
    
    // Find an active tank for this fuel type to use for KRA sync
    const tankResult: any = await query(`
      SELECT id, tank_name, kra_item_cd FROM tanks 
      WHERE branch_id = $1 AND fuel_type ILIKE $2 AND status = 'active' 
      ORDER BY current_stock DESC LIMIT 1
    `, [mapping.branch_id, `%${mapping.item_name}%`])
    
    const tanks = tankResult.rows || tankResult
    const tank = tanks[0]
    
    if (!tank) {
      console.log(`[PUMP CALLBACK] No active tank found for ${mapping.item_name} in branch ${mapping.branch_id}`)
    }
    
    // Generate invoice and receipt numbers
    const invoiceNumber = `PTS-${ptsId}-${data.Transaction}`
    const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`
    
    // Use the price from the callback, or fallback to mapped item price
    const unitPrice = data.Price || mapping.sale_price || 0
    const quantity = data.Volume || 0
    const totalAmount = data.Amount || (quantity * unitPrice)
    
    console.log(`[PUMP CALLBACK] Creating KRA sale:`)
    console.log(`  - Invoice: ${invoiceNumber}`)
    console.log(`  - Fuel: ${mapping.item_name}`)
    console.log(`  - Quantity: ${quantity}L @ KES ${unitPrice}`)
    console.log(`  - Total: KES ${totalAmount}`)
    
    // Call KRA save sales
    const kraResult = await callKraSaveSales({
      branch_id: mapping.branch_id,
      invoice_number: invoiceNumber,
      receipt_number: receiptNumber,
      fuel_type: mapping.item_name,
      quantity: quantity,
      unit_price: unitPrice,
      total_amount: totalAmount,
      payment_method: 'cash',
      customer_name: 'Walk-in Customer',
      customer_pin: '',
      sale_date: new Date().toISOString(),
      tank_id: tank?.id || null
    })
    
    // Create the sale record in database (marked as automated)
    const saleResult: any = await query(`
      INSERT INTO sales (
        branch_id, fuel_type, quantity, unit_price, total_amount,
        payment_method, customer_name, invoice_number, receipt_number,
        transmission_status, kra_status, is_automated, source_system, sale_date, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING id
    `, [
      mapping.branch_id,
      mapping.item_name,
      quantity,
      unitPrice,
      totalAmount,
      'cash',
      'Walk-in Customer (PTS)',
      invoiceNumber,
      receiptNumber,
      kraResult.success ? 'transmitted' : 'pending',
      kraResult.success ? 'success' : 'pending',
      true, // is_automated
      'PTS' // source_system
    ])
    
    const saleId = (saleResult.rows || saleResult)[0]?.id
    
    // Update pump transaction with sale reference and mark as processed
    await query(`
      UPDATE pump_transactions SET processed = true, sale_id = $1 WHERE id = $2
    `, [saleId, pumpTxId])
    
    // Update sale with KRA response if successful
    if (kraResult.success && kraResult.kraResponse?.data) {
      const kraData = kraResult.kraResponse.data
      await query(`
        UPDATE sales SET 
          kra_rcpt_sign = $1, kra_scu_id = $2, kra_cu_inv = $3, kra_internal_data = $4
        WHERE id = $5
      `, [
        kraData.rcptSign || '',
        kraData.sdcId || '',
        `${kraData.sdcId}/${kraData.rcptNo}`,
        kraData.intrlData || '',
        saleId
      ])
      console.log(`[PUMP CALLBACK] KRA sale created successfully - Receipt: ${kraData.rcptNo}`)
    } else {
      console.log(`[PUMP CALLBACK] KRA sale pending - ${kraResult.error || 'No KRA response'}`)
    }
    
    // Deduct from tank if found
    if (tank && quantity > 0) {
      await query(`
        UPDATE tanks SET current_stock = GREATEST(0, current_stock - $1), updated_at = NOW() WHERE id = $2
      `, [quantity, tank.id])
      console.log(`[PUMP CALLBACK] Deducted ${quantity}L from tank ${tank.tank_name}`)
    }
    
  } catch (error: any) {
    console.error(`[PUMP CALLBACK] Error creating KRA sale:`, error.message)
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: PumpCallbackPayload = await request.json()
    
    console.log("=".repeat(60))
    console.log("[PUMP CALLBACK] Received payload at:", new Date().toISOString())
    console.log("[PUMP CALLBACK] Protocol:", payload.Protocol)
    console.log("[PUMP CALLBACK] PtsId:", payload.PtsId)
    console.log("[PUMP CALLBACK] Packets count:", payload.Packets?.length || 0)
    console.log("[PUMP CALLBACK] Full payload:", JSON.stringify(payload, null, 2))
    console.log("=".repeat(60))

    const responsePackets = []

    for (const packet of payload.Packets || []) {
      responsePackets.push({
        Id: packet.Id,
        Message: "OK",
        Type: packet.Type
      })
    }

    const response = {
      Protocol: payload.Protocol || "jsonPTS",
      Packets: responsePackets
    }

    const eventResult: any = await query(`
      INSERT INTO pump_callback_events (pts_id, raw_request, raw_response)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [payload.PtsId, JSON.stringify(payload), JSON.stringify(response)])
    
    const eventId = (eventResult.rows || eventResult)[0]?.id

    for (const packet of payload.Packets || []) {
      console.log(`[PUMP CALLBACK] Processing packet Id: ${packet.Id}, Type: ${packet.Type}`)
      
      if (packet.Type === "UploadPumpTransaction" && packet.Data) {
        const data = packet.Data
        
        console.log(`[PUMP CALLBACK] Transaction details:`)
        console.log(`  - Pump: ${data.Pump}, Nozzle: ${data.Nozzle}`)
        console.log(`  - Fuel: ${data.FuelGradeName} (ID: ${data.FuelGradeId})`)
        console.log(`  - Volume: ${data.Volume}L, Amount: KES ${data.Amount}`)
        console.log(`  - Price: KES ${data.Price}`)
        console.log(`  - Transaction ID: ${data.Transaction}`)
        console.log(`  - DateTime: ${data.DateTime}`)
        
        try {
          const txResult: any = await query(`
            INSERT INTO pump_transactions (
              packet_id, pts_id, pump_number, nozzle_number, 
              fuel_grade_id, fuel_grade_name, transaction_id,
              volume, tc_volume, price, amount,
              total_volume, total_amount, tag, user_id,
              configuration_id, transaction_start, transaction_end,
              callback_event_id, raw_packet, created_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW()
            )
            ON CONFLICT (pts_id, transaction_id) DO UPDATE SET
              callback_event_id = EXCLUDED.callback_event_id,
              raw_packet = EXCLUDED.raw_packet
            RETURNING id, processed
          `, [
            packet.Id,
            payload.PtsId,
            data.Pump,
            data.Nozzle,
            data.FuelGradeId,
            data.FuelGradeName,
            data.Transaction,
            data.Volume,
            data.TCVolume,
            data.Price,
            data.Amount,
            data.TotalVolume,
            data.TotalAmount,
            data.Tag,
            data.UserId,
            data.ConfigurationId,
            data.DateTimeStart,
            data.DateTime,
            eventId,
            JSON.stringify(packet)
          ])
          
          const txRow = (txResult.rows || txResult)[0]
          const pumpTxId = txRow?.id
          const alreadyProcessed = txRow?.processed === true
          
          console.log(`[PUMP CALLBACK] Transaction ${data.Transaction} saved to database (id: ${pumpTxId})`)
          
          // Skip KRA sale creation if transaction was already processed
          if (alreadyProcessed) {
            console.log(`[PUMP CALLBACK] Transaction ${data.Transaction} already processed, skipping KRA sale creation`)
          } else {
            // Check for fuel grade mapping and create KRA sale
            await processAutoKraSale(payload.PtsId, data, pumpTxId)
          }
        } catch (dbError: any) {
          console.error(`[PUMP CALLBACK] Database error:`, dbError.message)
        }
      }
    }

    console.log("[PUMP CALLBACK] Sending response:", JSON.stringify(response, null, 2))
    console.log("=".repeat(60))

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[PUMP CALLBACK] Error processing callback:", error.message)
    console.error("[PUMP CALLBACK] Stack:", error.stack)
    
    return NextResponse.json({
      Protocol: "jsonPTS",
      Packets: [{
        Id: 0,
        Message: "ERROR",
        Type: "Error"
      }]
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "/api/pump-callback",
    description: "Pump transaction callback endpoint for automated sales",
    expectedPayload: {
      Protocol: "jsonPTS",
      PtsId: "string",
      Packets: [{
        Id: "number",
        Type: "UploadPumpTransaction",
        Data: {
          Pump: "number",
          Nozzle: "number",
          FuelGradeName: "string",
          Volume: "number",
          Amount: "number"
        }
      }]
    }
  })
}
