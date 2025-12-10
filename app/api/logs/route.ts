import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: logs, error } = await supabase
      .from("api_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500)

    if (error) {
      console.error("[v0] Error fetching logs:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("[v0] Error in logs API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("api_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000") // Delete all

    if (error) {
      console.error("[v0] Error clearing logs:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in logs delete API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
