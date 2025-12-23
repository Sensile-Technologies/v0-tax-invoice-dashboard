import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

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
          await query(`
            INSERT INTO pump_transactions (
              packet_id, pts_id, pump_number, nozzle_number, 
              fuel_grade_id, fuel_grade_name, transaction_id,
              volume, tc_volume, price, amount,
              total_volume, total_amount, tag, user_id,
              configuration_id, transaction_start, transaction_end,
              created_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW()
            )
            ON CONFLICT (pts_id, transaction_id) DO NOTHING
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
            data.DateTime
          ])
          
          console.log(`[PUMP CALLBACK] Transaction ${data.Transaction} saved to database`)
        } catch (dbError: any) {
          console.error(`[PUMP CALLBACK] Database error:`, dbError.message)
        }
      }

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
