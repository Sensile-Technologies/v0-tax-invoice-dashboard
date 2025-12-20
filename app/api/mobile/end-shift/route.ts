import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const body = await request.json()
    const { branch_id, shift_id, closing_cash, nozzle_readings, tank_volumes } = body

    if (!branch_id || !shift_id) {
      return NextResponse.json(
        { error: 'branch_id and shift_id are required' },
        { status: 400 }
      )
    }

    await client.query('BEGIN')

    const shiftResult = await client.query(
      `SELECT id, status FROM shifts WHERE id = $1 AND branch_id = $2`,
      [shift_id, branch_id]
    )

    if (shiftResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    if (shiftResult.rows[0].status !== 'active') {
      await client.query('ROLLBACK')
      return NextResponse.json({ error: 'Shift is not active' }, { status: 400 })
    }

    if (nozzle_readings && Array.isArray(nozzle_readings)) {
      for (const reading of nozzle_readings) {
        await client.query(
          `UPDATE nozzles SET meter_reading = $1 WHERE id = $2 AND branch_id = $3`,
          [reading.closing_reading, reading.nozzle_id, branch_id]
        )
      }
    }

    if (tank_volumes && Array.isArray(tank_volumes)) {
      for (const volume of tank_volumes) {
        await client.query(
          `UPDATE tanks SET current_volume = $1 WHERE id = $2 AND branch_id = $3`,
          [volume.closing_volume, volume.tank_id, branch_id]
        )
      }
    }

    await client.query(
      `UPDATE shifts 
       SET status = 'completed', 
           closing_cash = $1, 
           end_time = NOW(),
           updated_at = NOW()
       WHERE id = $2`,
      [closing_cash || 0, shift_id]
    )

    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      message: 'Shift ended successfully',
    })
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('Error ending shift:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to end shift' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
