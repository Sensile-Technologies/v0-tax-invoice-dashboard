import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sale_id, branch_id } = body

    if (!sale_id) {
      return NextResponse.json({ success: false, error: "Missing sale_id" }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      const result = await client.query(
        `UPDATE sales 
         SET original_printed = TRUE, updated_at = NOW()
         WHERE id = $1 AND original_printed = FALSE
         RETURNING id, original_printed`,
        [sale_id]
      )

      if (result.rowCount === 0) {
        const checkResult = await client.query(
          `SELECT original_printed FROM sales WHERE id = $1`,
          [sale_id]
        )
        
        if (checkResult.rows.length === 0) {
          return NextResponse.json({ success: false, error: "Sale not found" }, { status: 404 })
        }
        
        if (checkResult.rows[0].original_printed) {
          return NextResponse.json({ 
            success: true, 
            message: "Original already marked as printed",
            already_printed: true
          })
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: "Original invoice marked as printed",
        already_printed: false
      })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error("[Mark Printed] Error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to mark invoice as printed" 
    }, { status: 500 })
  }
}
