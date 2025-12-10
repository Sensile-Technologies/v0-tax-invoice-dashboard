import { NextResponse } from "next/server";
import { query } from "@/lib/db/client";

const ALLOWED_TABLES = [
  'users', 'branches', 'staff', 'tanks', 'dispensers', 'nozzles',
  'fuel_prices', 'shifts', 'sales', 'customers', 'loyalty_transactions',
  'items', 'item_compositions', 'stock_adjustments', 'stock_transfers',
  'credit_notes', 'hardware', 'device_initialization', 'code_lists',
  'item_classifications', 'notices', 'branch_insurances', 'branch_users',
  'imported_items', 'stock_master', 'sales_transactions', 'sales_transaction_items',
  'sales_receipts', 'purchase_transactions', 'purchase_transaction_items',
  'stock_movements', 'stock_movement_items', 'api_logs'
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    
    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Table not allowed' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const single = searchParams.get('single') === 'true';
    
    const filters: { column: string; operator: string; value: string }[] = [];
    searchParams.forEach((value, key) => {
      if (key.startsWith('filter_')) {
        const [column, operator, val] = value.split(':');
        filters.push({ column, operator, value: val });
      }
    });

    let sql = `SELECT * FROM ${table}`;
    const sqlParams: any[] = [];

    if (filters.length > 0) {
      const whereClauses = filters.map((f, i) => {
        sqlParams.push(f.value);
        return `${f.column} ${f.operator} $${i + 1}`;
      });
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    if (single) {
      sql += ' LIMIT 1';
    }

    const result = await query(sql, sqlParams);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Database query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    
    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Table not allowed' }, { status: 403 });
    }

    const body = await request.json();
    const { data } = body;
    
    const rows = Array.isArray(data) ? data : [data];
    if (rows.length === 0) {
      return NextResponse.json([]);
    }

    const columns = Object.keys(rows[0]);
    const values = rows.map((row, i) =>
      `(${columns.map((_, j) => `$${i * columns.length + j + 1}`).join(', ')})`
    ).join(', ');
    const sqlParams = rows.flatMap(row => columns.map(col => row[col]));

    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${values} RETURNING *`;
    const result = await query(sql, sqlParams);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Database insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    
    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Table not allowed' }, { status: 403 });
    }

    const body = await request.json();
    const { data, where } = body;

    const columns = Object.keys(data);
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const sqlParams = columns.map(col => data[col]);

    let sql = `UPDATE ${table} SET ${setClause}`;
    let paramIndex = sqlParams.length;

    if (where && where.length > 0) {
      const whereClauses = where.map((cond: any) => {
        paramIndex++;
        sqlParams.push(cond.value);
        return `${cond.column} ${cond.operator} $${paramIndex}`;
      });
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    sql += ' RETURNING *';
    const result = await query(sql, sqlParams);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Database update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    
    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Table not allowed' }, { status: 403 });
    }

    const body = await request.json();
    const { where } = body;

    let sql = `DELETE FROM ${table}`;
    const sqlParams: any[] = [];

    if (where && where.length > 0) {
      const whereClauses = where.map((cond: any, i: number) => {
        sqlParams.push(cond.value);
        return `${cond.column} ${cond.operator} $${i + 1}`;
      });
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    sql += ' RETURNING *';
    const result = await query(sql, sqlParams);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Database delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
