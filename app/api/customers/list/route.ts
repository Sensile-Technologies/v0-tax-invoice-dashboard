import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")
    const vendorId = searchParams.get("vendor_id")
    const userId = searchParams.get("user_id")
    
    let vendorFilter = vendorId
    
    if (userId && !vendorFilter) {
      const userResult = await query(
        `SELECT v.id as vendor_id FROM users u 
         JOIN vendors v ON v.email = u.email 
         WHERE u.id = $1`,
        [userId]
      )
      if (userResult && userResult.length > 0) {
        vendorFilter = userResult[0].vendor_id
      }
    }
    
    let result
    
    if (branchId) {
      result = await query(`
        SELECT 
          c.id,
          c.cust_nm as name,
          c.cust_no as customer_number,
          c.tel_no as phone,
          c.email,
          c.adrs as address,
          c.use_yn as status,
          c.branch_id,
          b.name as branch_name,
          COALESCE(
            (SELECT SUM(lt.points_earned) FROM loyalty_transactions lt WHERE lt.customer_pin = c.cust_tin AND lt.branch_id = c.branch_id),
            0
          ) as total_points,
          COALESCE(
            (SELECT COUNT(*) FROM sales s WHERE s.customer_name = c.cust_nm AND s.branch_id = c.branch_id),
            0
          ) as total_purchases,
          (SELECT MAX(lt.transaction_date) FROM loyalty_transactions lt WHERE lt.customer_pin = c.cust_tin AND lt.branch_id = c.branch_id) as last_activity
        FROM customers c
        LEFT JOIN branches b ON c.branch_id = b.id
        WHERE c.branch_id = $1 AND c.use_yn = 'Y'
        ORDER BY c.cust_nm
      `, [branchId])
    } else if (vendorFilter) {
      result = await query(`
        SELECT 
          c.id,
          c.cust_nm as name,
          c.cust_no as customer_number,
          c.tel_no as phone,
          c.email,
          c.adrs as address,
          c.use_yn as status,
          c.branch_id,
          b.name as branch_name,
          COALESCE(
            (SELECT SUM(lt.points_earned) FROM loyalty_transactions lt WHERE lt.customer_pin = c.cust_tin AND lt.branch_id = c.branch_id),
            0
          ) as total_points,
          COALESCE(
            (SELECT COUNT(*) FROM sales s WHERE s.customer_name = c.cust_nm AND s.branch_id = c.branch_id),
            0
          ) as total_purchases,
          (SELECT MAX(lt.transaction_date) FROM loyalty_transactions lt WHERE lt.customer_pin = c.cust_tin AND lt.branch_id = c.branch_id) as last_activity
        FROM customers c
        LEFT JOIN branches b ON c.branch_id = b.id
        WHERE b.vendor_id = $1 AND c.use_yn = 'Y'
        ORDER BY c.cust_nm
      `, [vendorFilter])
    } else {
      result = await query(`
        SELECT 
          c.id,
          c.cust_nm as name,
          c.cust_no as customer_number,
          c.tel_no as phone,
          c.email,
          c.adrs as address,
          c.use_yn as status,
          c.branch_id,
          b.name as branch_name,
          COALESCE(
            (SELECT SUM(lt.points_earned) FROM loyalty_transactions lt WHERE lt.customer_pin = c.cust_tin AND lt.branch_id = c.branch_id),
            0
          ) as total_points,
          COALESCE(
            (SELECT COUNT(*) FROM sales s WHERE s.customer_name = c.cust_nm AND s.branch_id = c.branch_id),
            0
          ) as total_purchases,
          (SELECT MAX(lt.transaction_date) FROM loyalty_transactions lt WHERE lt.customer_pin = c.cust_tin AND lt.branch_id = c.branch_id) as last_activity
        FROM customers c
        LEFT JOIN branches b ON c.branch_id = b.id
        WHERE c.use_yn = 'Y'
        ORDER BY c.cust_nm
      `)
    }

    return NextResponse.json({ customers: result })
  } catch (error: any) {
    console.error("Error fetching customers:", error)
    return NextResponse.json(
      { error: "Failed to fetch customers", details: error.message },
      { status: 500 }
    )
  }
}
