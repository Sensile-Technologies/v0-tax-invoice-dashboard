import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    
    const cookieStore = await cookies()
    const branchId = cookieStore.get("branch_id")?.value
    
    let bhfId = null
    
    if (branchId) {
      const branchResult = await query(
        "SELECT bhf_id FROM branches WHERE id = $1",
        [branchId]
      )
      if (branchResult.length > 0) {
        bhfId = branchResult[0].bhf_id
      }
    }
    
    if (!bhfId) {
      const defaultBranch = await query(
        "SELECT bhf_id FROM branches WHERE bhf_id IS NOT NULL AND status = 'active' LIMIT 1"
      )
      if (defaultBranch.length > 0) {
        bhfId = defaultBranch[0].bhf_id
      }
    }

    if (type === "codelist") {
      // First try to get data for the specific branch
      let result = bhfId 
        ? await query(
            `SELECT cd_cls, cd, cd_nm, cd_desc, use_yn, updated_at 
             FROM kra_codelists 
             WHERE bhf_id = $1 
             ORDER BY cd_cls, cd`,
            [bhfId]
          )
        : []
      
      // If no data for this branch, get data from any branch (codelists are shared)
      if (result.length === 0) {
        result = await query(
          `SELECT DISTINCT ON (cd_cls, cd) cd_cls, cd, cd_nm, cd_desc, use_yn, updated_at 
           FROM kra_codelists 
           ORDER BY cd_cls, cd, updated_at DESC`
        )
      }
      
      return NextResponse.json({ 
        data: result,
        bhf_id: bhfId,
        source: result.length > 0 ? "database" : "none"
      })
    }
    
    if (type === "classifications") {
      const result = bhfId 
        ? await query(
            `SELECT item_cls_cd, item_cls_nm, item_cls_lvl, tax_ty_cd, use_yn, updated_at 
             FROM kra_item_classifications 
             WHERE bhf_id = $1 
             ORDER BY item_cls_cd`,
            [bhfId]
          )
        : []
      
      return NextResponse.json({ 
        data: result,
        bhf_id: bhfId,
        source: result.length > 0 ? "database" : "none"
      })
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
  } catch (error) {
    console.error("Error fetching saved KRA data:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
