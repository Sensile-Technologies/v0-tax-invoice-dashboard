# Flow360 Release Notes v2.0

## Overview

This release includes **200 commits** with significant enhancements to shift management, financial tracking, KRA compliance, PTS integration, and mobile app functionality. Below is a comprehensive guide to all changes since the last deployment.

---

## Table of Contents

1. [Database Migration Guide](#database-migration-guide)
2. [End Shift & Reconciliation Workflow](#end-shift--reconciliation-workflow)
3. [Expense Tracking](#expense-tracking)
4. [Banking Management](#banking-management)
5. [Credit Transactions](#credit-transactions)
6. [Bulk Sales Management](#bulk-sales-management)
7. [PTS Controller Integration](#pts-controller-integration)
8. [Purchase Order Acceptance](#purchase-order-acceptance)
9. [KRA Integration Improvements](#kra-integration-improvements)
10. [Invoice Printing Workflow](#invoice-printing-workflow)
11. [Staff Management Updates](#staff-management-updates)
12. [Sales Summary & Reporting](#sales-summary--reporting)
13. [Customer Management](#customer-management)
14. [Mobile App Changes](#mobile-app-changes)
15. [API Changes](#api-changes)

---

## Database Migration Guide

### Migration Files

Three migration files have been created for the production database:

| File | Purpose | Order |
|------|---------|-------|
| `database/migration-incremental-simple.sql` | Creates 17 new tables | Run First |
| `database/migration-columns.sql` | Adds columns to existing tables | Run Second |
| `database/migration-indexes.sql` | Adds performance indexes | Run Third |

### New Tables Created

| Table | Purpose |
|-------|---------|
| `expense_accounts` | Expense categories per vendor |
| `shift_expenses` | Track expenses during shifts |
| `banking_accounts` | Bank accounts per vendor |
| `shift_banking` | Banking activities during shifts |
| `attendant_collections` | Payment collections per attendant |
| `credit_payments` | Credit transaction payment records |
| `customer_branches` | Link customers to multiple branches |
| `bulk_sales` | Uninvoiced fuel sold during shifts |
| `pump_callback_events` | Raw PTS controller callbacks |
| `pump_transactions` | Individual pump transactions from PTS |
| `pump_fuel_grade_mappings` | Map PTS fuel grades to items |
| `purchase_order_acceptances` | PO delivery acceptance records |
| `po_acceptance_tank_readings` | Tank readings during PO acceptance |
| `po_acceptance_nozzle_readings` | Nozzle readings during PO acceptance |
| `po_acceptance_dispenser_readings` | Dispenser readings during PO acceptance |
| `vendor_po_sequences` | PO number sequences per vendor |
| `device_initialization` | KRA device initialization data |

### New Columns on Existing Tables

| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| `staff` | `vendor_id` | uuid | Direct vendor association |
| `sales` | `original_printed` | boolean | Track original invoice printed |
| `sales` | `kra_internal_data` | text | Store KRA intrlData |
| `sales` | `item_id` | uuid | Link to items table |
| `branches` | `bulk_sales_kra_percentage` | integer | KRA transmission rate for bulk sales |
| `branches` | `controller_id` | varchar | PTS controller identifier |
| `shifts` | `reconciliation_status` | text | pending/reconciled status |
| `shift_readings` | `incoming_attendant_id` | uuid | Incoming attendant assignment |
| `shift_readings` | `rtt` | numeric | Return to tank value |
| `shift_readings` | `self_fueling` | numeric | Self-fueling value |
| `shift_readings` | `prepaid_sale` | numeric | Prepaid sale value |
| `nozzles` | `item_id` | uuid | Link to items |
| `nozzles` | `tank_id` | uuid | Link to tanks |
| `dispensers` | `item_id` | uuid | Link to items |
| `dispensers` | `tank_id` | uuid | Link to tanks |
| `items` | `color_code` | varchar(10) | Chart visualization color |
| `loyalty_transactions` | `item_id` | uuid | Link to items |
| `api_logs` | `external_endpoint` | text | Track external API calls |

---

## End Shift & Reconciliation Workflow

The shift closing process has been redesigned into a **two-phase workflow**:

### Phase 1: Close Shift (Supervisor)

1. **Record Closing Meter Readings**
   - Enter closing readings for each nozzle
   - System calculates meter difference automatically
   - Optional fields: RTT (Return to Tank), Self-Fueling, Prepaid Sales

2. **Assign Incoming Attendants**
   - Select which attendant will take over each nozzle
   - Incoming attendant sees their opening reading = previous closing

3. **What Happens**
   - Shift status changes to "closed"
   - Outgoing attendants are flagged for reconciliation
   - New shift begins for incoming attendants

### Phase 2: Reconciliation (Outgoing Attendants)

1. **Mandatory Before Next Shift**
   - Outgoing attendants cannot start a new shift until reconciled
   - System shows expected vs actual collections

2. **Collection Entry**
   - Enter actual cash collected
   - Enter mobile money (M-Pesa, etc.)
   - Enter card payments
   - System calculates variance

3. **Banking Summary**
   - Record amounts deposited to each bank account
   - Multiple accounts supported per vendor

4. **What Happens**
   - Reconciliation status changes to "reconciled"
   - Data available in Daily Sales Report
   - Variance tracked for accountability

### Key Fields

| Field | Description |
|-------|-------------|
| RTT (Return to Tank) | Fuel returned from vehicle to tank |
| Self-Fueling | Fuel used for company vehicles |
| Prepaid Sale | Sales paid in advance but not yet dispensed |
| Meter Difference | Closing reading - Opening reading |
| Volume Sold | Meter Difference - RTT - Self-Fueling + Prepaid |

---

## Expense Tracking

### Setup (Headquarters)

1. **Create Expense Accounts**
   - Navigate to Settings > Expense Accounts
   - Create categories like: Salaries, Utilities, Repairs, Supplies
   - Each account is vendor-specific

### Recording Expenses (During Shift)

1. **Shift Closure Screen**
   - "Add Expense" button available
   - Select expense account from dropdown
   - Enter amount and description
   - Multiple expenses can be added

2. **What Happens**
   - Expenses deducted from cash to be banked
   - Tracked in Daily Report with breakdown by account

### Reporting

- Expenses appear in X/Z Reports
- Daily Sales Report shows expense summary
- Filter by date range, branch, or account

---

## Banking Management

### Setup (Headquarters)

1. **Create Banking Accounts**
   - Navigate to Settings > Banking Accounts
   - Add bank name, account name, account number
   - Mark one as "Default" for the vendor
   - Accounts are vendor-wide (all branches can use)

### Recording Banking (During Reconciliation)

1. **Reconciliation Screen**
   - Banking section shows all vendor accounts
   - Enter amount deposited to each account
   - Total should match: Cash Collected - Expenses

2. **What Happens**
   - Banking entries recorded per shift
   - Appears in Daily Sales Report banking summary
   - Enables bank reconciliation

---

## Credit Transactions

### New Feature: Credit Payments

Track and manage credit given to customers or for purchases.

### Types of Credit

| Type | Description |
|------|-------------|
| Customer Credit | Fuel sold on credit to customers |
| Purchase Credit | Fuel purchased on credit from suppliers |

### Recording Credit Payments

1. **Navigate to Credit Transactions**
2. **View Outstanding Credits**
   - Lists all unpaid credit transactions
   - Shows customer/supplier, amount, date

3. **Record Payment**
   - Select credit transaction
   - Enter payment amount (partial or full)
   - Add payment reference (e.g., receipt number)
   - Add notes if needed

4. **What Happens**
   - Payment recorded against credit
   - Outstanding balance updated
   - History maintained for auditing

---

## Bulk Sales Management

### What Are Bulk Sales?

Fuel dispensed but not individually invoiced during a shift. Common scenarios:
- Walk-in customers paying cash without requesting invoice
- High-volume periods where individual invoicing is impractical

### How It Works

1. **Automatic Calculation**
   - System calculates: Meter Difference - Invoiced Quantity = Bulk Quantity
   - Done per nozzle during shift closure

2. **Invoice Generation**
   - "Generate Bulk Invoices" action available
   - System creates multiple small invoices (e.g., 20L each)
   - Each invoice transmitted to KRA

### KRA Intermittency Rate

- **What**: Percentage of bulk sales to transmit to KRA
- **Default**: 100% (all bulk sales invoiced)
- **Who Can Change**: Directors and Vendors only
- **Location**: Branch Settings > KRA Configuration

### Example

| Metric | Value |
|--------|-------|
| Closing Reading | 15,000 L |
| Opening Reading | 10,000 L |
| Meter Difference | 5,000 L |
| Invoiced Quantity | 3,500 L |
| Bulk Quantity | 1,500 L |
| Intermittency Rate | 100% |
| Invoices Generated | 75 (at 20L each) |

---

## PTS Controller Integration

### Overview

Integration with Pump Transaction System (PTS) controllers for automated fuel dispensing tracking.

### Setup

1. **Assign Controller to Branch**
   - Branch Settings > Controller ID
   - Enter the PTS controller identifier

2. **Configure Fuel Grade Mappings**
   - Settings > Fuel Grade Mappings
   - Map PTS fuel grades (1, 2, 3) to Flow360 items
   - Example: Fuel Grade 1 → Super Petrol

### How It Works

1. **Controller Callback**
   - When fuel is dispensed, PTS sends callback to Flow360
   - Endpoint: `/api/pump-callback`
   - Data includes: pump number, nozzle, volume, amount

2. **Transaction Processing**
   - Raw callback stored in `pump_callback_events`
   - Parsed data stored in `pump_transactions`
   - Matched to branch using controller_id

3. **Automated Sales**
   - Pump transactions can auto-create sales records
   - Reduces manual entry
   - Ensures accuracy

### Controller Logs

- View raw callbacks: Branch > Controller Logs
- Debug integration issues
- Track all PTS communication

---

## Purchase Order Acceptance

### Overview

Complete workflow for accepting fuel deliveries against purchase orders.

### Workflow

1. **Create Purchase Order (HQ)**
   - Directors create PO for branch
   - Specify items, quantities, supplier
   - PO status: "Pending Approval"

2. **Approve Purchase Order (HQ)**
   - Another director/vendor approves
   - PO status: "Approved"
   - Now visible to branch

3. **Accept Delivery (Branch)**
   - When bowser arrives, navigate to PO
   - Click "Accept Delivery"
   - Enter:
     - Bowser volume (from delivery note)
     - Tank readings before/after
     - Nozzle readings before/after
     - Dispenser readings before/after
     - Dips (mm) if applicable

4. **Variance Calculation**
   - System calculates variance between expected and actual
   - Tank variance = After volume - Before volume
   - Total variance shown for accountability

5. **Complete Acceptance**
   - PO status: "Delivered"
   - Stock automatically updated
   - Acceptance record created with all readings

### Reports

- Purchase Order Report shows all POs with status
- Acceptance details available per PO
- Variance tracking for loss prevention

---

## KRA Integration Improvements

### CU Invoice Number Format

The correct format for CU INV NO is:
```
{sdcId}/{rcptNo}
```
Example: `KRACU0300003796/378`

### Internal Data Storage

- KRA returns `intrlData` with each transaction
- Now stored separately in `sales.kra_internal_data`
- Used for verification and auditing

### Initialize Feature

1. **Purpose**: Fetch and store KRA device configuration
2. **Location**: Branch Settings > KRA > Initialize
3. **What It Does**:
   - Calls KRA selectInitInfo endpoint
   - Stores device serial, SDC ID, keys
   - Stores counter positions

### Resubmit to KRA

For failed KRA transmissions:
1. Navigate to Sales Reports
2. Find sale with `kra_status = 'failed'`
3. Click dropdown > "Resubmit to KRA"
4. System retries transmission

### Auto-Retry Logic

- Failed transmissions auto-retry up to 3 times
- Exponential backoff: 1s, 2s, 4s
- Manual retry always available

---

## Invoice Printing Workflow

### Original vs Copy

| Type | Behavior |
|------|----------|
| Original | Prints once only, no watermark |
| Copy | Prints unlimited times, with "*** INVOICE COPY ***" watermark |

### How It Works

1. **New Invoice Created**
   - `original_printed = false`
   - "Print" button available in Status column

2. **First Print (Original)**
   - Click "Print" in Status column
   - Original printed without watermark
   - `original_printed = true`
   - Status column shows "Printed" badge

3. **Subsequent Prints (Copy)**
   - Use dropdown menu > "Print Copy"
   - Adds watermark to receipt
   - No limit on copies

### Mobile App

- Same workflow applies
- After successful print, app calls `/api/sales/mark-printed`
- **Note**: APK rebuild required for tracking to work

---

## Staff Management Updates

### Vendor ID Association

Staff members are now directly associated with vendors via `staff.vendor_id`:

**Previous Behavior**:
- Staff belonged to branches
- Vendor determined by branch
- Staff changing branches could "disappear"

**New Behavior**:
- Staff have direct `vendor_id`
- Survives branch changes
- Resolution order:
  1. `staff.vendor_id` (if set)
  2. `branch.vendor_id` (if staff has branch)
  3. Vendor email match (fallback)

### Default Password Change

- **New Default**: `flow360`
- **Previous**: `flow360123`
- Used when resetting passwords

### Staff Roles

| Role | Dashboard Access | Mobile Access | Branch Restricted |
|------|------------------|---------------|-------------------|
| Vendor | Full | No | No |
| Director | Full | No | No |
| Manager | Branch Only | No | Yes |
| Supervisor | Branch Only | Yes | Yes |
| Cashier | No | Yes | Yes |
| Attendant | No | Yes | Yes |

---

## Sales Summary & Reporting

### New Sales Summary Page

Navigate to Reports > Sales Summary for:

1. **Product Breakdown**
   - Sales by fuel type/item
   - Chart visualization using `items.color_code`
   - Quantity and amount columns

2. **Payment Method Breakdown**
   - Cash, M-Pesa, Card, Credit
   - Totals per method

3. **KRA Transmission Status**
   - Pending, Transmitted, Failed counts
   - Filter by status

### X/Z Report Enhancements

New sections added:
- Product sales breakdown by item
- KRA transmitted vs pending
- Expense summary
- Banking summary
- Collection summary per attendant

### Daily Sales Report

Enhanced with:
- Attendant collection breakdown
- Banking summary by account
- Expense summary by account
- Variance calculations

---

## Customer Management

### Multi-Branch Customers

Customers can now be linked to multiple branches:

1. **Customer Creation**
   - Created at one branch
   - Stored in `customers` table

2. **Link to Additional Branches**
   - Navigate to customer
   - "Add Branch" option
   - Customer now available at both branches

3. **Benefits**
   - Single KRA PIN across branches
   - Unified customer view
   - Credit tracking across branches

### Loyalty Integration

- `loyalty_transactions` now links to `items` via `item_id`
- Better tracking of which products earn loyalty points
- Reports show item-level loyalty breakdown

---

## Mobile App Changes

### Print Tracking

After successful print, mobile app now calls:
```
POST /api/sales/mark-printed
{ sale_id: "..." }
```

This marks the original as printed.

**Files Changed**:
- `mobile/src/screens/CreateInvoiceScreen.tsx`
- `mobile/src/screens/InvoicesScreen.tsx`

**APK Rebuild Required**: Yes, for print tracking to work.

### No Breaking Changes

- Print functionality unchanged
- Receipt format unchanged
- All existing features work

---

## API Changes

### New Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sales/mark-printed` | POST | Mark invoice original as printed |
| `/api/sales/resubmit-kra` | POST | Retry KRA transmission |
| `/api/credit-transactions` | GET/POST | Manage credit transactions |
| `/api/credit-payments` | POST | Record credit payments |
| `/api/expense-accounts` | GET/POST | Manage expense accounts |
| `/api/banking-accounts` | GET/POST | Manage banking accounts |
| `/api/shift-expenses` | POST | Record shift expenses |
| `/api/shift-banking` | POST | Record shift banking |
| `/api/attendant-collections` | POST | Record attendant collections |
| `/api/bulk-sales` | GET/POST | Manage bulk sales |
| `/api/bulk-sales/generate-invoices` | POST | Generate bulk sale invoices |
| `/api/pump-callback` | POST | Receive PTS callbacks |
| `/api/pump-transactions` | GET | View pump transactions |
| `/api/fuel-grade-mappings` | GET/POST | Manage PTS fuel mappings |
| `/api/purchase-orders/accept` | POST | Accept PO delivery |
| `/api/branches/intermittency-rate` | PUT | Update bulk sales KRA rate |
| `/api/kra/initialize` | POST | Initialize KRA device |

### Modified Endpoints

| Endpoint | Change |
|----------|--------|
| `/api/staff/list` | Now includes vendor_id resolution |
| `/api/staff/create` | Sets vendor_id from branch |
| `/api/staff/update` | Maintains vendor_id sync |
| `/api/staff/reset-password` | Uses new default "flow360" |
| `/api/sales` | Includes item_id, kra_internal_data |
| `/api/shifts/close` | Two-phase workflow support |
| `/api/shifts/reconcile` | New reconciliation support |

---

## Deployment Checklist

### Before Deployment

1. [ ] Backup production database
2. [ ] Run `migration-incremental-simple.sql`
3. [ ] Run `migration-columns.sql`
4. [ ] Run `migration-indexes.sql`
5. [ ] Verify all tables created
6. [ ] Verify all columns added

### After Deployment

1. [ ] Test shift close workflow
2. [ ] Test reconciliation workflow
3. [ ] Test expense tracking
4. [ ] Test banking entries
5. [ ] Test invoice printing (original/copy)
6. [ ] Test KRA transmission
7. [ ] Rebuild mobile APK if print tracking needed

### Rollback Plan

If issues occur:
1. Use Replit checkpoint rollback for code
2. Use point-in-time restore for database
3. Contact support with specific error messages

---

## Support

For questions or issues:
- Check Branch Logs for API errors
- Check Controller Logs for PTS issues
- Review KRA response in sales record

---

*Document Version: 2.0*
*Last Updated: January 18, 2026*
