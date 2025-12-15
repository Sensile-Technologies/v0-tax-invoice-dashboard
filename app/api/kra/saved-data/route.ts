import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (type === "codelist") {
      // Codelists are shared across all vendors and branches
      // Get distinct entries by cd_cls and cd, using the most recent update
      const result = await query(
        `SELECT DISTINCT ON (cd_cls, cd) cd_cls, cd, cd_nm, cd_desc, use_yn, updated_at 
         FROM kra_codelists 
         WHERE use_yn = 'Y'
         ORDER BY cd_cls, cd, updated_at DESC`
      )
      
      return NextResponse.json({ 
        data: result,
        source: result.length > 0 ? "database" : "none"
      })
    }
    
    if (type === "classifications") {
      // Item classifications are shared across all vendors and branches
      // Get distinct entries by item_cls_cd, using the most recent update
      const result = await query(
        `SELECT DISTINCT ON (item_cls_cd) item_cls_cd, item_cls_nm, item_cls_lvl, tax_ty_cd, use_yn, updated_at 
         FROM kra_item_classifications 
         WHERE use_yn = 'Y'
         ORDER BY item_cls_cd, updated_at DESC`
      )
      
      return NextResponse.json({ 
        data: result,
        source: result.length > 0 ? "database" : "none"
      })
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
  } catch (error) {
    console.error("Error fetching saved KRA data:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
