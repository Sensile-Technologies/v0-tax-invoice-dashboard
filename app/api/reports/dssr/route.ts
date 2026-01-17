import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

interface NozzleReading {
  nozzle_id: string
  nozzle_name: string
  dispenser_number: number
  nozzle_number: number
  fuel_type: string
  closing_meter: number
  opening_meter: number
  throughput: number
  rtt: number
  pump_sales: number
}

interface ProductMovement {
  product: string
  opening_stock: number
  offloaded_volume: number
  closing_stock: number
  tank_sales: number
  pump_sales: number
  variance: number
  variance_percent: number
}

interface ProductCashFlow {
  product: string
  total_sales_litres: number
  pump_price: number
  amount: number
  actual_cash: number
  difference: number
}

interface DailyCashFlow {
  opening_cash: number
  day_shift_cash: number
  night_shift_cash: number
  cash_banked: number
  closing_cash: number
  physical_count: number
  difference: number
}

interface AttendantCollection {
  staff_id: string
  staff_name: string
  cash: number
  mpesa: number
  card: number
  mobile_money: number
  credit: number
  total: number
}

interface BankingEntry {
  id: string
  account_name: string
  bank_name: string
  amount: number
  notes: string | null
  created_at: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')
    const date = searchParams.get('date')

    if (!branchId || !date) {
      return NextResponse.json(
        { error: "branch_id and date are required" },
        { status: 400 }
      )
    }

    const startOfDay = `${date}T00:00:00`
    const endOfDay = `${date}T23:59:59`

    const shiftsQuery = `
      SELECT 
        s.id,
        s.start_time,
        s.end_time,
        s.status,
        s.opening_cash,
        s.closing_cash,
        COALESCE(st.full_name, 'Unknown') as cashier_name,
        CASE 
          WHEN EXTRACT(HOUR FROM s.start_time) < 14 THEN 'day'
          ELSE 'night'
        END as shift_type
      FROM shifts s
      LEFT JOIN staff st ON s.staff_id = st.id
      WHERE s.branch_id = $1
        AND s.start_time >= $2
        AND s.start_time <= $3
      ORDER BY s.start_time ASC
    `
    const shiftsResult = await pool.query(shiftsQuery, [branchId, startOfDay, endOfDay])
    const shiftIds = shiftsResult.rows.map(s => s.id)

    const nozzleReadings: NozzleReading[] = []
    const productNozzleTotals: Map<string, { throughput: number, rtt: number, pump_sales: number, price_per_litre: number, amount: number }> = new Map()

    const branchItemPricesQuery = `
      SELECT i.item_name, bi.sale_price
      FROM branch_items bi
      JOIN items i ON bi.item_id = i.id
      WHERE bi.branch_id = $1 AND bi.is_available = true
    `
    const branchItemPricesResult = await pool.query(branchItemPricesQuery, [branchId])
    const productPrices: Map<string, number> = new Map()
    for (const row of branchItemPricesResult.rows) {
      productPrices.set(row.item_name, parseFloat(row.sale_price) || 0)
    }

    if (shiftIds.length > 0) {
      const nozzleQuery = `
        SELECT 
          sr.nozzle_id,
          sr.opening_reading,
          sr.closing_reading,
          COALESCE(sr.rtt, 0) as rtt,
          d.dispenser_number,
          n.nozzle_number,
          COALESCE(i.item_name, 'Unknown') as fuel_type
        FROM shift_readings sr
        JOIN nozzles n ON sr.nozzle_id = n.id
        LEFT JOIN dispensers d ON n.dispenser_id = d.id
        LEFT JOIN items i ON n.item_id = i.id
        WHERE sr.shift_id = ANY($1) AND sr.reading_type = 'nozzle'
        ORDER BY d.dispenser_number, n.nozzle_number
      `
      const nozzleResult = await pool.query(nozzleQuery, [shiftIds])

      const nozzleAggregates = new Map<string, { 
        nozzle_id: string, 
        nozzle_name: string,
        dispenser_number: number,
        nozzle_number: number,
        fuel_type: string,
        min_opening: number, 
        max_closing: number, 
        total_rtt: number 
      }>()

      for (const row of nozzleResult.rows) {
        const key = row.nozzle_id
        const opening = parseFloat(row.opening_reading) || 0
        const closing = parseFloat(row.closing_reading) || 0
        const rtt = parseFloat(row.rtt) || 0

        if (!nozzleAggregates.has(key)) {
          nozzleAggregates.set(key, {
            nozzle_id: row.nozzle_id,
            nozzle_name: `D${row.dispenser_number}N${row.nozzle_number}`,
            dispenser_number: row.dispenser_number || 0,
            nozzle_number: row.nozzle_number || 0,
            fuel_type: row.fuel_type,
            min_opening: opening,
            max_closing: closing,
            total_rtt: rtt
          })
        } else {
          const existing = nozzleAggregates.get(key)!
          if (opening < existing.min_opening) existing.min_opening = opening
          if (closing > existing.max_closing) existing.max_closing = closing
          existing.total_rtt += rtt
        }
      }

      for (const [_, data] of nozzleAggregates) {
        const throughput = data.max_closing - data.min_opening
        const pump_sales = throughput - data.total_rtt

        nozzleReadings.push({
          nozzle_id: data.nozzle_id,
          nozzle_name: data.nozzle_name,
          dispenser_number: data.dispenser_number,
          nozzle_number: data.nozzle_number,
          fuel_type: data.fuel_type,
          closing_meter: data.max_closing,
          opening_meter: data.min_opening,
          throughput: throughput,
          rtt: data.total_rtt,
          pump_sales: pump_sales
        })

        const pricePerLitre = productPrices.get(data.fuel_type) || 0
        const existing = productNozzleTotals.get(data.fuel_type) || { throughput: 0, rtt: 0, pump_sales: 0, price_per_litre: pricePerLitre, amount: 0 }
        existing.throughput += throughput
        existing.rtt += data.total_rtt
        existing.pump_sales += pump_sales
        existing.price_per_litre = pricePerLitre
        existing.amount = existing.pump_sales * pricePerLitre
        productNozzleTotals.set(data.fuel_type, existing)
      }
    }

    const productMovement: ProductMovement[] = []

    const tankQuery = `
      SELECT 
        t.id as tank_id,
        t.tank_name,
        COALESCE(i.item_name, 'Unknown') as fuel_type,
        t.current_stock
      FROM tanks t
      LEFT JOIN items i ON t.item_id = i.id
      WHERE t.branch_id = $1
      ORDER BY i.item_name, t.tank_name
    `
    const tankResult = await pool.query(tankQuery, [branchId])

    const productTankData: Map<string, { 
      opening_stock: number, 
      offloaded: number, 
      closing_stock: number 
    }> = new Map()

    for (const tank of tankResult.rows) {
      if (shiftIds.length > 0) {
        const tankReadingsQuery = `
          SELECT 
            sr.opening_reading,
            sr.closing_reading,
            COALESCE(sr.stock_received, 0) as stock_received
          FROM shift_readings sr
          WHERE sr.shift_id = ANY($1) AND sr.tank_id = $2 AND sr.reading_type = 'tank'
          ORDER BY sr.created_at ASC
        `
        const tankReadings = await pool.query(tankReadingsQuery, [shiftIds, tank.tank_id])

        let opening = 0
        let closing = parseFloat(tank.current_stock) || 0
        let offloaded = 0

        if (tankReadings.rows.length > 0) {
          opening = parseFloat(tankReadings.rows[0].opening_reading) || 0
          closing = parseFloat(tankReadings.rows[tankReadings.rows.length - 1].closing_reading) || closing
          offloaded = tankReadings.rows.reduce((sum: number, r: any) => sum + (parseFloat(r.stock_received) || 0), 0)
        }

        const existing = productTankData.get(tank.fuel_type) || { opening_stock: 0, offloaded: 0, closing_stock: 0 }
        existing.opening_stock += opening
        existing.offloaded += offloaded
        existing.closing_stock += closing
        productTankData.set(tank.fuel_type, existing)
      }
    }

    for (const [product, tankData] of productTankData) {
      const nozzleData = productNozzleTotals.get(product) || { throughput: 0, rtt: 0, pump_sales: 0 }
      const tank_sales = tankData.opening_stock + tankData.offloaded - tankData.closing_stock
      const variance = nozzleData.pump_sales - tank_sales
      const variance_percent = tank_sales > 0 ? (variance / tank_sales) * 100 : (variance !== 0 ? 100 : 0)

      productMovement.push({
        product,
        opening_stock: tankData.opening_stock,
        offloaded_volume: tankData.offloaded,
        closing_stock: tankData.closing_stock,
        tank_sales: tank_sales,
        pump_sales: nozzleData.pump_sales,
        variance: variance,
        variance_percent: variance_percent
      })
    }

    const productCashFlow: ProductCashFlow[] = []

    for (const [product, nozzleData] of productNozzleTotals) {
      const priceQuery = `
        SELECT COALESCE(bi.sale_price, 0) as sale_price
        FROM items i
        LEFT JOIN branch_items bi ON bi.item_id = i.id AND bi.branch_id = $1
        WHERE i.item_name = $2
        LIMIT 1
      `
      const priceResult = await pool.query(priceQuery, [branchId, product])
      const pump_price = parseFloat(priceResult.rows[0]?.sale_price) || 0
      const amount = nozzleData.pump_sales * pump_price

      productCashFlow.push({
        product,
        total_sales_litres: nozzleData.pump_sales,
        pump_price,
        amount,
        actual_cash: 0,
        difference: 0
      })
    }

    const totalSalesAmount = productCashFlow.reduce((sum, p) => sum + p.amount, 0)

    let totalCollections = 0
    if (shiftIds.length > 0) {
      const collectionsQuery = `
        SELECT COALESCE(SUM(ac.amount), 0) as total_collections
        FROM attendant_collections ac
        WHERE ac.shift_id = ANY($1)
      `
      const collectionsResult = await pool.query(collectionsQuery, [shiftIds])
      totalCollections = parseFloat(collectionsResult.rows[0]?.total_collections) || 0
    }

    let openingCash = 0
    let dayShiftCash = 0
    let nightShiftCash = 0
    let cashBanked = 0
    let closingCash = 0

    for (let i = 0; i < shiftsResult.rows.length; i++) {
      const shift = shiftsResult.rows[i]
      
      if (i === 0) {
        openingCash = parseFloat(shift.opening_cash) || 0
      }
      if (i === shiftsResult.rows.length - 1) {
        closingCash = parseFloat(shift.closing_cash) || 0
      }
      
      const shiftCollections = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as cash_collected
         FROM attendant_collections WHERE shift_id = $1 AND payment_method = 'cash'`,
        [shift.id]
      )
      const cashCollected = parseFloat(shiftCollections.rows[0]?.cash_collected) || 0
      
      if (shift.shift_type === 'day') {
        dayShiftCash += cashCollected
      } else {
        nightShiftCash += cashCollected
      }
    }

    if (shiftIds.length > 0) {
      const bankingQuery = `
        SELECT COALESCE(SUM(sb.amount), 0) as total_banked
        FROM shift_banking sb
        WHERE sb.shift_id = ANY($1)
      `
      const bankingResult = await pool.query(bankingQuery, [shiftIds])
      cashBanked = parseFloat(bankingResult.rows[0]?.total_banked) || 0
    }

    const dailyCashFlow: DailyCashFlow = {
      opening_cash: openingCash,
      day_shift_cash: dayShiftCash,
      night_shift_cash: nightShiftCash,
      cash_banked: cashBanked,
      closing_cash: closingCash,
      physical_count: closingCash,
      difference: (openingCash + dayShiftCash + nightShiftCash - cashBanked) - closingCash
    }

    const attendantCollections: AttendantCollection[] = []
    if (shiftIds.length > 0) {
      const collectionsDetailQuery = `
        SELECT 
          ac.staff_id,
          COALESCE(st.full_name, 'Unknown') as staff_name,
          COALESCE(SUM(CASE WHEN ac.payment_method = 'cash' THEN ac.amount ELSE 0 END), 0) as cash,
          COALESCE(SUM(CASE WHEN ac.payment_method = 'mpesa' THEN ac.amount ELSE 0 END), 0) as mpesa,
          COALESCE(SUM(CASE WHEN ac.payment_method = 'card' THEN ac.amount ELSE 0 END), 0) as card,
          COALESCE(SUM(CASE WHEN ac.payment_method = 'mobile_money' THEN ac.amount ELSE 0 END), 0) as mobile_money,
          COALESCE(SUM(CASE WHEN ac.payment_method = 'credit' THEN ac.amount ELSE 0 END), 0) as credit,
          COALESCE(SUM(ac.amount), 0) as total
        FROM attendant_collections ac
        LEFT JOIN staff st ON ac.staff_id = st.id
        WHERE ac.shift_id = ANY($1)
        GROUP BY ac.staff_id, st.full_name
        ORDER BY st.full_name
      `
      const collectionsDetailResult = await pool.query(collectionsDetailQuery, [shiftIds])
      for (const row of collectionsDetailResult.rows) {
        attendantCollections.push({
          staff_id: row.staff_id,
          staff_name: row.staff_name,
          cash: parseFloat(row.cash) || 0,
          mpesa: parseFloat(row.mpesa) || 0,
          card: parseFloat(row.card) || 0,
          mobile_money: parseFloat(row.mobile_money) || 0,
          credit: parseFloat(row.credit) || 0,
          total: parseFloat(row.total) || 0
        })
      }
    }

    const bankingEntries: BankingEntry[] = []
    if (shiftIds.length > 0) {
      const bankingDetailQuery = `
        SELECT 
          sb.id,
          ba.account_name,
          ba.bank_name,
          sb.amount,
          sb.notes,
          sb.created_at
        FROM shift_banking sb
        LEFT JOIN banking_accounts ba ON sb.banking_account_id = ba.id
        WHERE sb.shift_id = ANY($1)
        ORDER BY sb.created_at
      `
      const bankingDetailResult = await pool.query(bankingDetailQuery, [shiftIds])
      for (const row of bankingDetailResult.rows) {
        bankingEntries.push({
          id: row.id,
          account_name: row.account_name || 'Unknown Account',
          bank_name: row.bank_name || '',
          amount: parseFloat(row.amount) || 0,
          notes: row.notes,
          created_at: row.created_at
        })
      }
    }

    const branchQuery = `SELECT name FROM branches WHERE id = $1`
    const branchResult = await pool.query(branchQuery, [branchId])
    const branchName = branchResult.rows[0]?.name || 'Unknown Branch'

    return NextResponse.json({
      success: true,
      data: {
        date,
        branch_name: branchName,
        shifts: shiftsResult.rows.map(s => ({
          id: s.id,
          start_time: s.start_time,
          end_time: s.end_time,
          cashier_name: s.cashier_name,
          shift_type: s.shift_type
        })),
        nozzle_readings: nozzleReadings.sort((a, b) => {
          if (a.dispenser_number !== b.dispenser_number) return a.dispenser_number - b.dispenser_number
          return a.nozzle_number - b.nozzle_number
        }),
        product_nozzle_totals: Array.from(productNozzleTotals.entries()).map(([product, data]) => ({
          product,
          ...data
        })),
        product_movement: productMovement,
        product_cash_flow: productCashFlow,
        daily_cash_flow: dailyCashFlow,
        attendant_collections: attendantCollections,
        banking_entries: bankingEntries,
        totals: {
          total_sales_amount: totalSalesAmount,
          total_collections: totalCollections,
          sales_vs_collections_diff: totalSalesAmount - totalCollections
        }
      }
    })

  } catch (error) {
    console.error("DSSR API error:", error)
    return NextResponse.json(
      { error: "Failed to generate DSSR report" },
      { status: 500 }
    )
  }
}
