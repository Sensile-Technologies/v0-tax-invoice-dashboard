# KRA TIMS Integration Documentation

## Overview
This system provides full integration with Kenya Revenue Authority's Tax Invoice Management System (TIMS/VSCU).

## Database Schema

### Core Tables Created:

1. **customers** - Branch-specific customer records with TIN validation
2. **code_lists** - Tax codes, units, payment types, and other reference data
3. **item_classifications** - Product classification hierarchy
4. **branch_users** - Branch-specific user accounts for KRA access
5. **branch_insurances** - Insurance mark configuration per branch
6. **imported_items** - Import declaration tracking
7. **device_initialization** - VSCU device setup and key management
8. **purchase_transactions** - Purchase invoice records with tax breakdown
9. **purchase_transaction_items** - Line items for purchases
10. **sales_transactions** - Sales invoice records with tax calculations
11. **sales_transaction_items** - Line items for sales
12. **sales_receipts** - Receipt details for sales transactions
13. **stock_movements** - Stock adjustment records
14. **stock_movement_items** - Line items for stock movements
15. **stock_master** - Current stock levels per item
16. **notices** - KRA system notices and alerts

## API Endpoints

### Device Management
- `POST /api/kra/init` - Initialize VSCU device for branch

### Customer Management
- `POST /api/kra/customers/save` - Register/update customer

### Transaction Management
- `POST /api/kra/purchases/save` - Save purchase transaction
- `POST /api/kra/sales/save` - Save sales transaction (auto-increments invoice numbers)

### Stock Management
- `POST /api/kra/stock/save` - Record stock movements and update stock master

### Reference Data
- `GET /api/kra/codes?cdCls=<class>` - Get code lists by classification
- `POST /api/kra/codes` - Save/update code list entries

### Notifications
- `GET /api/kra/notices?tin=<tin>&bhfId=<id>` - Get KRA notices for branch

## Key Features

### Tax Calculations
- Automatic tax breakdown by type (A-E categories)
- Tax rates: A(16%), B(8%), C(0%), D(Exempt), E(Special)
- Separate tracking of taxable amounts and tax amounts per category

### Invoice Numbering
- Auto-increment invoice numbers per branch
- Tracks last invoice numbers in device_initialization table
- Separate sequences for purchases, sales, receipts, training, proforma, and copies

### Stock Management
- Real-time stock movements tracking
- Stock master table maintains current inventory levels
- Integration with purchase and sales transactions

### Compliance
- All tables follow KRA TIMS field naming conventions
- Full audit trail with regr_id, regr_nm, modr_id, modr_nm fields
- Row Level Security (RLS) enabled on all tables

## Usage Example

### Initialize Device:
\`\`\`javascript
POST /api/kra/init
{
  "data": {
    "tin": "P051234567A",
    "bhfId": "00",
    "dvcSrlNo": "VSCU00123456",
    "taxprNm": "Sample Petroleum Station",
    "bhfNm": "Main Branch"
  }
}
\`\`\`

### Save Sales Transaction:
\`\`\`javascript
POST /api/kra/sales/save
{
  "tin": "P051234567A",
  "bhfId": "00",
  "custTin": "A001234567C",
  "custNm": "John Doe",
  "salesTyCd": "N",
  "rcptTyCd": "S",
  "pmtTyCd": "01",
  "salesDt": "20250110",
  "totItemCnt": 1,
  "taxblAmtA": 1000.00,
  "taxAmtA": 160.00,
  "totTaxblAmt": 1000.00,
  "totTaxAmt": 160.00,
  "totAmt": 1160.00,
  "itemList": [
    {
      "itemSeq": 1,
      "itemCd": "RW1PET001",
      "itemNm": "Petrol",
      "qty": 10.5,
      "prc": 95.24,
      "splyAmt": 1000.00,
      "taxTyCd": "A",
      "taxblAmt": 1000.00,
      "taxAmt": 160.00,
      "totAmt": 1160.00
    }
  ]
}
\`\`\`

## Integration Notes

- The system uses branch names as bhfId mapping
- All monetary values use DECIMAL(15,5) for precision
- Dates are stored in ISO format
- Response format follows KRA standard: resultCd, resultMsg, resultDt, data
- Success code: '000', Error codes: '001', '999'
