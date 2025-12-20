import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const vendor_id = searchParams.get('vendor_id')
  const branch_id = searchParams.get('branch_id')

  if (!vendor_id && !branch_id) {
    return NextResponse.json({ error: 'vendor_id or branch_id is required' }, { status: 400 })
  }

  const client = await pool.connect()
  try {
    let branchesQuery = ''
    let branchesParams: string[] = []

    if (vendor_id) {
      branchesQuery = `
        SELECT id, name, location 
        FROM branches 
        WHERE vendor_id = $1 
        ORDER BY name
      `
      branchesParams = [vendor_id]
    } else if (branch_id) {
      branchesQuery = `
        SELECT id, name, location 
        FROM branches 
        WHERE id = $1
      `
      branchesParams = [branch_id]
    }

    const branchesResult = await client.query(branchesQuery, branchesParams)
    const branches = branchesResult.rows

    const branchData = await Promise.all(
      branches.map(async (branch) => {
        const nozzlesResult = await client.query(
          `SELECT id, name, fuel_type, meter_reading 
           FROM nozzles 
           WHERE branch_id = $1 
           ORDER BY name`,
          [branch.id]
        )

        const tanksResult = await client.query(
          `SELECT id, name, fuel_type, current_volume, capacity 
           FROM tanks 
           WHERE branch_id = $1 
           ORDER BY name`,
          [branch.id]
        )

        const activeShiftResult = await client.query(
          `SELECT id, status, created_at 
           FROM shifts 
           WHERE branch_id = $1 AND status = 'active' 
           ORDER BY created_at DESC 
           LIMIT 1`,
          [branch.id]
        )

        return {
          id: branch.id,
          name: branch.name,
          location: branch.location,
          nozzles: nozzlesResult.rows.map((n) => ({
            id: n.id,
            name: n.name,
            fuel_type: n.fuel_type,
            current_reading: parseFloat(n.meter_reading) || 0,
            closing_reading: null,
          })),
          tanks: tanksResult.rows.map((t) => ({
            id: t.id,
            name: t.name,
            fuel_type: t.fuel_type,
            current_volume: parseFloat(t.current_volume) || 0,
            capacity: parseFloat(t.capacity) || 0,
            closing_volume: null,
          })),
          active_shift: activeShiftResult.rows[0] || null,
        }
      })
    )

    return NextResponse.json({ branches: branchData })
  } catch (error: any) {
    console.error('Error fetching vendor branches:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch branches' }, { status: 500 })
  } finally {
    client.release()
  }
}
