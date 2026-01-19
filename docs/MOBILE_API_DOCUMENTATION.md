# Flow360 Mobile APK API Documentation

**Version:** 1.0  
**Last Updated:** January 2026

**Base URL:** `https://[YOUR-PRODUCTION-DOMAIN]/api/mobile`

> Replace `[YOUR-PRODUCTION-DOMAIN]` with your deployed Flow360 instance URL.

---

## Authentication

All endpoints require authentication via session cookie. The third-party system must:

1. **Login** via `/api/auth/login` to obtain a session
2. **Include session cookie** in all subsequent requests
3. **Branch access** is controlled by the authenticated user's permissions

### Login Endpoint

**POST** `/api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response:** Sets `user_session` httpOnly cookie for subsequent requests.

---

## Table of Contents

1. [Dashboard](#1-dashboard)
2. [Nozzles](#2-nozzles)
3. [Products](#3-products)
4. [Sales](#4-sales)
5. [Create Sale (with KRA Integration)](#5-create-sale-with-kra-integration)
6. [Shift Management](#6-shift-management)
7. [Invoices](#7-invoices)
8. [Loyalty Customer Verification](#8-loyalty-customer-verification)
9. [Loyalty Transaction](#9-loyalty-transaction)
10. [Printer Logs](#10-printer-logs)

---

## 1. Dashboard

Get daily sales statistics for a branch or shift.

**Endpoint:** `GET /api/mobile/dashboard`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branch_id` | UUID | Optional | Filter by branch |
| `shift_id` | UUID | Optional | Filter by specific shift (takes precedence) |

### Response

```json
{
  "total_sales": 150000.00,
  "total_invoices": 45,
  "pending_invoices": 3,
  "paid_invoices": 42
}
```

### Field Descriptions

| Field | Description |
|-------|-------------|
| `total_sales` | Sum of all sales amounts for today/shift |
| `total_invoices` | Count of all invoices |
| `pending_invoices` | Count of credit (unpaid) invoices |
| `paid_invoices` | Count of paid invoices |

---

## 2. Nozzles

Get available nozzles and fuel prices for a branch. **Only returns nozzles with assigned tanks.**

**Endpoint:** `GET /api/mobile/nozzles`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branch_id` | UUID | Yes | Branch identifier |

### Response

```json
{
  "nozzles": [
    {
      "id": "a6f47228-5d93-4981-a670-bbeb05dbbd7d",
      "name": "D1N1 - Petrol",
      "fuel_type": "Petrol",
      "status": "active",
      "price": 210.50
    }
  ],
  "fuel_prices": [
    {
      "fuel_type": "Petrol",
      "price": 210.50
    },
    {
      "fuel_type": "Diesel",
      "price": 195.00
    }
  ]
}
```

### Important Notes

- Nozzles without a tank assignment (`tank_id IS NULL`) are excluded
- Prices are sourced from `branch_items` table (single source of truth)
- Nozzle names follow format: `D{dispenser_number}N{nozzle_number} - {fuel_type}`

---

## 3. Products

Get available products for a branch with current prices and stock levels.

**Endpoint:** `GET /api/mobile/products`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branch_id` | UUID | Yes | Branch identifier |

### Response

```json
{
  "products": [
    {
      "id": "item-uuid",
      "item_cd": "ITEM001",
      "item_nm": "Petrol",
      "item_cls_cd": "FUEL",
      "pkg_unit_cd": "L",
      "qty_unit_cd": "L",
      "unit_price": 210.50,
      "stock_quantity": 15000.00,
      "status": "active"
    }
  ]
}
```

---

## 4. Sales

Get today's sales and create new sales (simple version without KRA).

### GET - Fetch Sales

**Endpoint:** `GET /api/mobile/sales`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branch_id` | UUID | Yes | Branch identifier |

### Response

```json
{
  "sales": [...],
  "shift": {
    "id": "shift-uuid",
    "status": "active",
    "start_time": "2026-01-19T06:00:00Z"
  },
  "nozzles": [...],
  "fuel_prices": [...]
}
```

### POST - Create Sale (Simple)

**Endpoint:** `POST /api/mobile/sales`

### Request Body

```json
{
  "branch_id": "uuid",
  "shift_id": "uuid",
  "nozzle_id": "uuid",
  "fuel_type": "Petrol",
  "amount": 5000.00,
  "payment_method": "cash",
  "customer_name": "John Doe",
  "vehicle_number": "KBZ 123A",
  "staff_id": "uuid"
}
```

---

## 5. Create Sale (with KRA Integration)

Create a fuel sale with automatic KRA eTIMs invoice transmission.

**Endpoint:** `POST /api/mobile/create-sale`

### Request Body

```json
{
  "branch_id": "uuid",
  "user_id": "uuid",
  "nozzle_id": "uuid",
  "fuel_type": "Petrol",
  "quantity": 23.75,
  "unit_price": 210.50,
  "total_amount": 5000.00,
  "payment_method": "cash",
  "customer_name": "John Doe",
  "kra_pin": "A123456789B",
  "vehicle_number": "KBZ 123A",
  "is_loyalty_customer": false,
  "loyalty_customer_name": null,
  "loyalty_customer_pin": null
}
```

### Request Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `branch_id` | UUID | Yes | Branch identifier |
| `user_id` | UUID | No | User creating the sale |
| `nozzle_id` | UUID | No | Nozzle used (must have tank assigned) |
| `fuel_type` | String | Yes | "Petrol", "Diesel", or "Kerosene" |
| `quantity` | Number | No | Liters sold (calculated from total_amount/price if not provided) |
| `unit_price` | Number | No | Price per liter (fetched from branch_items if not provided) |
| `total_amount` | Number | Yes | Total sale amount in KES |
| `payment_method` | String | No | "cash", "mpesa", "card", "credit" (default: "cash") |
| `customer_name` | String | No | Customer name (default: "Walk-in Customer") |
| `kra_pin` | String | No | Customer KRA PIN for tax invoice |
| `vehicle_number` | String | No | Vehicle registration number |
| `is_loyalty_customer` | Boolean | No | Whether this is a loyalty customer |
| `loyalty_customer_name` | String | No | Loyalty customer name |
| `loyalty_customer_pin` | String | No | Loyalty customer KRA PIN |

### Success Response

```json
{
  "success": true,
  "sale_id": "339decef-f6b9-40a8-be4f-f77d488efa64",
  "sale": {
    "id": "339decef-f6b9-40a8-be4f-f77d488efa64",
    "branch_id": "uuid",
    "shift_id": "uuid",
    "invoice_number": "INV-MKKTSZ3J",
    "receipt_number": "RCP-MKKTSZ3J",
    "fuel_type": "Petrol",
    "quantity": 23.75,
    "unit_price": 210.50,
    "total_amount": 5000.00,
    "kra_status": "success"
  },
  "invoice_number": "INV-MKKTSZ3J",
  "receipt_number": "RCP-MKKTSZ3J",
  "kra_success": true,
  "kra_response": {...},
  "print_data": {
    "invoice_number": "KRACU0300003796/378",
    "receipt_no": "378",
    "cu_serial_number": "KRACU0300003796",
    "cu_invoice_no": "KRACU0300003796/378",
    "intrl_data": "encrypted-kra-data",
    "branch_name": "Main Station",
    "branch_address": "123 Main Street",
    "branch_phone": "+254700123456",
    "branch_pin": "P000123456A",
    "item_code": "PETROL01",
    "receipt_signature": "kra-signature",
    "bhf_id": "03",
    "customer_name": "John Doe",
    "customer_pin": "A123456789B",
    "is_loyalty_customer": false
  }
}
```

### Error Responses

**Nozzle without tank assigned:**
```json
{
  "error": "Cannot sell from nozzle D1N1 - no tank assigned. Please assign a tank in Manage Nozzles."
}
```

**Missing required fields:**
```json
{
  "error": "Missing required fields: branch_id=null, fuel_type=null, total_amount=null"
}
```

**Tank not mapped:**
```json
{
  "error": "Tank \"Tank 1\" is not mapped to an item. Please map the tank to an item in the item list before selling."
}
```

### Duplicate Detection

If the same sale (same branch, fuel_type, total_amount) is submitted within 60 seconds with a successful KRA response, the API returns the existing sale to prevent double-invoicing:

```json
{
  "success": true,
  "sale_id": "existing-uuid",
  "duplicate": true,
  "message": "Sale already submitted to KRA within the last 60 seconds",
  ...
}
```

---

## 6. Shift Management

Start shifts from mobile (ending shifts must be done via web dashboard).

**Endpoint:** `POST /api/mobile/sales/shift`

### Start Shift

```json
{
  "action": "start",
  "branch_id": "uuid",
  "opening_cash": 5000.00,
  "user_id": "uuid",
  "staff_id": "uuid"
}
```

### Response

```json
{
  "success": true,
  "shift": {
    "id": "uuid",
    "branch_id": "uuid",
    "staff_id": "uuid",
    "start_time": "2026-01-19T06:00:00Z",
    "status": "active",
    "opening_cash": 5000.00
  }
}
```

### End Shift (Disabled)

Shift ending is **disabled** on mobile APK. Shifts must be ended via the web dashboard with meter readings entry.

```json
{
  "action": "end",
  "shift_id": "uuid"
}
```

Response:
```json
{
  "error": "Shifts can only be ended from the web dashboard. Please use the Shift Management page to enter closing meter readings and end the shift."
}
```

---

## 7. Invoices

Retrieve and create invoices.

### GET - Fetch Invoices

**Endpoint:** `GET /api/mobile/invoices`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branch_id` | UUID | No | Filter by branch |
| `user_id` | UUID | No | Filter by staff |
| `date_from` | Date | No | Start date (YYYY-MM-DD) |
| `date_to` | Date | No | End date (YYYY-MM-DD) |
| `limit` | Number | No | Max results (default: 100) |

### Response

```json
{
  "sales": [
    {
      "id": "uuid",
      "invoice_number": "INV-MKKTSZ3J",
      "customer_name": "John Doe",
      "customer_pin": "A123456789B",
      "sale_date": "2026-01-19T10:30:00Z",
      "fuel_type": "Petrol",
      "quantity": 23.75,
      "unit_price": 210.50,
      "total_amount": 5000.00,
      "payment_method": "cash",
      "cu_serial_number": "KRACU0300003796",
      "cu_invoice_no": "KRACU0300003796/378",
      "intrl_data": "encrypted-data",
      "receipt_signature": "signature",
      "branch_name": "Main Station",
      "branch_address": "123 Main Street",
      "branch_phone": "+254700123456",
      "branch_pin": "P000123456A",
      "bhf_id": "03",
      "cashier_name": "Jane",
      "status": "paid"
    }
  ]
}
```

### POST - Create Invoice

**Endpoint:** `POST /api/mobile/invoices`

```json
{
  "customer_name": "John Doe",
  "customer_phone": "+254700123456",
  "items": [
    {
      "product_id": "uuid",
      "product_name": "Petrol",
      "quantity": 23.75,
      "unit_price": 210.50,
      "discount": 0,
      "total": 5000.00
    }
  ],
  "subtotal": 5000.00,
  "tax": 800.00,
  "total": 5800.00,
  "user_id": "uuid",
  "branch_id": "uuid"
}
```

---

## 8. Loyalty Customer Verification

Verify if a phone number belongs to a registered loyalty customer.

**Endpoint:** `GET /api/mobile/verify-loyalty`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branch_id` | UUID | Yes | Branch identifier |
| `phone` | String | Yes | Customer phone number |

### Response (Customer Found)

```json
{
  "customer": {
    "id": "uuid",
    "cust_nm": "John Doe",
    "tel_no": "+254700123456",
    "cust_tin": "A123456789B"
  }
}
```

### Response (Not Found)

```json
{
  "customer": null
}
```

---

## 9. Loyalty Transaction

Record a loyalty points transaction for a sale.

**Endpoint:** `POST /api/mobile/loyalty-transaction`

### Request Body

```json
{
  "branch_id": "uuid",
  "sale_id": "uuid",
  "customer_name": "John Doe",
  "customer_pin": "A123456789B",
  "transaction_amount": 5000.00,
  "fuel_type": "Petrol",
  "quantity": 23.75,
  "payment_method": "cash"
}
```

### Response

```json
{
  "success": true,
  "transaction_id": "uuid",
  "points_earned": 50
}
```

### Points Calculation

- 1 point per 100 KES spent
- Example: KES 5,000 = 50 points

---

## 10. Printer Logs

Log printer events for debugging and audit purposes.

### POST - Create Log

**Endpoint:** `POST /api/mobile/printer-logs`

```json
{
  "branch_id": "uuid",
  "vendor_id": "uuid",
  "user_id": "uuid",
  "username": "john_doe",
  "step": "print_started",
  "status": "info",
  "message": "Starting receipt print",
  "invoice_number": "INV-MKKTSZ3J",
  "error_details": null
}
```

### Log Steps

| Step | Description |
|------|-------------|
| `print_started` | Print job initiated |
| `print_success` | Print completed successfully |
| `print_failed` | Print failed |
| `bluetooth_connected` | Printer connected via Bluetooth |
| `bluetooth_disconnected` | Printer disconnected |
| `paper_out` | Printer out of paper |

### GET - Fetch Logs

**Endpoint:** `GET /api/mobile/printer-logs`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branch_id` | UUID | No | Filter by branch |
| `vendor_id` | UUID | No | Filter by vendor |
| `limit` | Number | No | Max results (default: 50) |

---

## Error Handling

All endpoints return errors in consistent format:

```json
{
  "error": "Error message description"
}
```

HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `403` - Forbidden (action not allowed)
- `404` - Not Found
- `500` - Internal Server Error

---

## Common Headers

```http
Content-Type: application/json
```

---

## Notes

1. **Tank Assignment Required**: Nozzles must have a tank assigned to be used for sales. Sales from unassigned nozzles are blocked.

2. **Price Source**: All prices come from `branch_items` table. If no price is configured, sales will fail.

3. **KRA Integration**: The `/create-sale` endpoint automatically submits invoices to KRA eTIMs and returns the receipt data for printing.

4. **Shift Ending**: Shifts cannot be ended from the mobile app. Use the web dashboard to enter closing meter readings and reconcile.

5. **Duplicate Prevention**: Sales with identical branch, fuel type, and amount within 60 seconds return the existing sale instead of creating duplicates.
