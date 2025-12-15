import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await query(
      "SELECT * FROM branches WHERE id = $1",
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("[Branch GET Error]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const {
      name,
      location,
      manager,
      email,
      phone,
      address,
      county,
      localTaxOffice,
      storageIndices,
      tankConfig,
    } = body

    const result = await query(
      `UPDATE branches SET
        name = COALESCE($1, name),
        location = COALESCE($2, location),
        manager = COALESCE($3, manager),
        email = COALESCE($4, email),
        phone = COALESCE($5, phone),
        address = COALESCE($6, address),
        county = COALESCE($7, county),
        local_tax_office = COALESCE($8, local_tax_office),
        storage_indices = COALESCE($9, storage_indices),
        tank_config = COALESCE($10, tank_config),
        updated_at = NOW()
      WHERE id = $11
      RETURNING *`,
      [
        name,
        location,
        manager,
        email,
        phone,
        address,
        county,
        localTaxOffice,
        storageIndices ? JSON.stringify(storageIndices) : null,
        tankConfig ? JSON.stringify(tankConfig) : null,
        id,
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("[Branch PUT Error]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const result = await query(
      `UPDATE branches SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("[Branch PATCH Error]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await query(
      "DELETE FROM branches WHERE id = $1 RETURNING *",
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, deleted: result.rows[0] })
  } catch (error) {
    console.error("[Branch DELETE Error]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
