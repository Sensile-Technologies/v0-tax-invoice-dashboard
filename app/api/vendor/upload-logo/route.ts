import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { cookies } from "next/headers"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

async function getSessionUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('user_session')
  
  if (!sessionCookie?.value) {
    return null
  }
  
  try {
    const sessionData = JSON.parse(sessionCookie.value)
    if (!sessionData.id) return null
    
    const users = await query(
      `SELECT u.id, u.email, u.username, 
       COALESCE(s.role, u.role) as role,
       COALESCE(v.id, b.vendor_id) as vendor_id
       FROM users u 
       LEFT JOIN vendors v ON v.email = u.email 
       LEFT JOIN staff s ON s.user_id = u.id
       LEFT JOIN branches b ON b.id = s.branch_id
       WHERE u.id = $1`,
      [sessionData.id]
    )
    
    return users[0] || null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const role = (user.role || '').toLowerCase()
    if (!['vendor', 'director'].includes(role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    
    if (!user.vendor_id) {
      return NextResponse.json({ error: "No vendor associated with user" }, { status: 400 })
    }

    const formData = await request.formData()
    const fileEntry = formData.get('logo')
    const file = fileEntry instanceof File ? fileEntry : null
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Please upload a JPG, PNG, GIF, WebP, or SVG image." }, { status: 400 })
    }

    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 2MB." }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const filename = `${user.vendor_id}-${Date.now()}.${ext}`
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'logos')
    await mkdir(uploadsDir, { recursive: true })
    
    const filepath = path.join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    const logoUrl = `/uploads/logos/${filename}`

    await query(
      `UPDATE vendors SET logo_url = $1, updated_at = NOW() WHERE id = $2`,
      [logoUrl, user.vendor_id]
    )

    return NextResponse.json({ success: true, logo_url: logoUrl })
  } catch (error) {
    console.error("Error uploading logo:", error)
    return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 })
  }
}
