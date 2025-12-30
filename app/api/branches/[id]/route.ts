import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const rows = await query(
      "SELECT * FROM branches WHERE id = $1",
      [id]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
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
      kraPin,
      controllerId,
    } = body

    const rows = await query(
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
        kra_pin = COALESCE($10, kra_pin),
        controller_id = COALESCE($11, controller_id),
        updated_at = NOW()
      WHERE id = $12
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
        kraPin || null,
        controllerId || null,
        id,
      ]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
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

    const rows = await query(
      `UPDATE branches SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
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

    const rows = await query(
      "DELETE FROM branches WHERE id = $1 RETURNING *",
      [id]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, deleted: rows[0] })
  } catch (error) {
    console.error("[Branch DELETE Error]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
