# Flow360 - Business Management Dashboard

## Overview
Flow360 is a Next.js 16 business management application for fuel station management with features for sales, purchases, inventory, payments, customers, staff management, and reports. Includes integration points for KRA (Kenya Revenue Authority) TIMS.

## Tech Stack
- **Framework**: Next.js 16.0.7 with React 19
- **Styling**: Tailwind CSS 4.x with shadcn/ui components
- **Database**: Replit PostgreSQL (via DATABASE_URL)
- **Authentication**: Custom (Supabase client interface replaced with local PostgreSQL)
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation

## Project Structure
- `/app` - Next.js App Router pages and API routes
- `/components` - React components including UI primitives
- `/lib` - Utility functions, auth helpers, and API configurations
  - `/lib/db` - PostgreSQL database client
  - `/lib/supabase` - Supabase-compatible wrapper using local PostgreSQL
- `/hooks` - Custom React hooks
- `/public` - Static assets and images
- `/scripts` - SQL migration scripts
- `/mobile` - Expo React Native mobile app for cashiers/supervisors
  - `/mobile/src/screens` - Login, Dashboard, Invoice creation, Invoice history
  - `/mobile/src/context` - Auth context provider
  - `/mobile/src/api` - API client for backend communication

## Development
- **Dev Server**: `npm run dev` on port 5000
- **Build**: `npm run build`
- **Start**: `npm run start`

## Environment Variables
The app uses Replit's built-in PostgreSQL via DATABASE_URL (auto-configured).

## Database Schema
The local Replit PostgreSQL database has the full schema with 30+ tables:
- Core: Users, Branches, Staff
- Fuel management: Tanks, Dispensers, Nozzles, Fuel Prices
- Sales and Shifts
- Customers and Loyalty
- Items and Inventory
- KRA TIMS integration tables
- Stock management and transfers
- API logging

## Recent Changes
- 2024-12-13: Sales Dropdown Menu Implementation
  - Made Sales a dropdown menu in sidebar with 3 options
  - Created /sales/summary page with statistics, pie charts, and daily sales trend with date filters
  - Created /sales/reports page with transaction table, filters, and pagination (50 per page)
  - Created /sales/automated page for externally posted transactions with status tracking
  - Original /sales page still available with full SalesContent component

- 2024-12-13: KRA API Branch-Specific BHF ID & Dashboard Header Updates
  - Updated KRA API endpoints (/api/kra/codes, /api/kra/items/classifications, /api/kra/notices) to accept x-branch-id header
  - KRA APIs now use branch-specific BHF ID instead of defaulting to first active branch
  - Added proper bhf_id validation with user-friendly error messages
  - Updated tax-service configuration page to pass branch_id to KRA API calls
  - Dashboard header now shows "Welcome back, [username]" greeting
  - Dashboard header uses user's assigned branch_name (with localStorage override support)
  - Fixed notices API to use local PostgreSQL (query) instead of Supabase
  - Mobile app dashboard now shows username and branch name instead of role
  - Fixed staff list API to filter by vendor_id - users only see staff from their own vendor's branches
  - Fixed branches list API to filter by vendor_id - users only see branches from their own vendor
  - Updated staff-management and headquarters pages to pass user_id when fetching branches
  - Fixed branch staff page - now fetches real staff data filtered by branch_id instead of hardcoded data
  - Fixed loyalty customers tab - fetches customers from database with points and purchases scoped by branch
  - Created /api/customers/list endpoint for fetching customers with loyalty data
  - Signup now creates Director staff record for the user who signs up

- 2024-12-13: Staff Management & Shift Closure Enhancements
  - Removed placeholder staff data from Staff Management page - now fetches from database
  - Fixed branch dropdown in Add Staff form - uses /api/branches/list instead of broken Supabase URL
  - Created /api/staff/list endpoint - fetches staff with branch names
  - Created /api/staff/reset-password endpoint - resets staff password to default
  - Created /api/staff/update-status endpoint - toggles staff active/inactive status
  - Fixed KRA payload TIN format - now uses kra_pin field from branches table instead of bhf_id
  - Enhanced shift closure CSV processing to calculate meter reading differences and create bulk sales:
    - Calculates quantity sold = new reading - old reading
    - Fetches fuel price and creates sales records
    - UUID-based invoice/receipt numbers (no race conditions)
    - Guards against negative/zero quantities
    - Transactional control per branch with rollback on error
    - Updated SHIFT_MANAGEMENT_README.md with sales calculation documentation

- 2024-12-12: KRA Test Sales Integration
  - Created lib/kra-sales-api.ts - helper function to call external KRA backend API
  - Calls KRA endpoint at http://{server_address}:{server_port}/trnsSales/saveSales
  - Updated /api/mobile/create-sale to call KRA endpoint after sale creation
  - Created /api/kra/test-sale endpoint for web dashboard to call KRA API
  - Updated web sales-content.tsx handleCreateSale to call KRA endpoint after sale creation
  - All KRA API calls are logged to api_logs table with request/response details
  - Console logging added for debugging: [KRA API], [Mobile Create Sale], [Web Sale]

- 2024-12-12: Mobile App Loyalty & Discount Features
  - Added discount option to web Record Fuel Sale popup (fixed or percentage)
  - Added discount option to mobile Create Invoice screen (fixed or percentage)
  - Implemented 3-step loyalty customer verification flow:
    - Step 1: Nozzle selection and amount entry
    - Step 2: Customer details with "Loyalty Customer" checkbox
    - Step 3: Phone verification for loyalty customers (only if checkbox checked)
  - Created /api/mobile/verify-loyalty endpoint - verifies customer by phone number
  - Created /api/mobile/loyalty-transaction endpoint - records loyalty points (1 point per 100 KES)
  - Removed all placeholder/mock nozzle data - now uses only real API data
  - Added proper error handling with user-friendly messages and retry functionality
  - Updated /api/mobile/create-sale to return sale_id for loyalty transaction linking

- 2024-12-12: Mobile App Enhancements
  - Customer name field made optional in Create Sale screen (defaults to "Walk-in Customer")
  - Changed payment method terminology from "mpesa" to "Mobile Money" across all screens
  - Dashboard now shows dynamic data filtered by branch_id (today's sales, invoices, paid/pending)
  - Products screen shows fuel products (Kerosene, Petrol) for the branch from fuel_prices table
  - Sales History screen with date/time filtering (Today, Last 7 Days, Last 30 Days, Custom Range)
  - Invoices API updated to query sales table with date range filtering
  - Mobile API endpoints: /api/mobile/dashboard, /api/mobile/invoices, /api/mobile/products

- 2024-12-12: Mobile App for Cashiers/Supervisors
  - Created Expo React Native mobile app in /mobile directory
  - Mobile screens: Login (role-restricted), Dashboard, Create Invoice, Invoice History
  - Mobile API endpoints: /api/mobile/dashboard, /api/mobile/invoices
  - Auth context with secure storage for session persistence
  - Bottom tab navigation with Flow360 branding
  - APK build configuration via EAS (eas.json)

- 2024-12-11: Branch Configuration & KRA Data Storage
  - Added server_address and server_port columns to branches table for backend configuration
  - Onboarding API now saves complete backend config (server address, port, BHF ID, device token) per branch
  - Security Settings page loads branch configuration from database and displays all settings
  - Created kra_codelists table to store KRA code lists per BHF ID
  - Created kra_item_classifications table to store item classifications per BHF ID
  - Tax Service Configuration page loads saved codelists/classifications on page load
  - Added saved data count display and BHF ID badge on tax service page

- 2024-12-11: UI and Workflow Enhancements
  - Changed admin top nav bar background to night sky blue (#0a1628)
  - Updated logo to use Flow360 circular logo image (public/flow360-logo.png)
  - Removed "Settings" text from nav, kept gear icon next to bell icon
  - Added notifications for recurring invoices that are due
  - Fixed Signup vs Onboarding workflow: Signup Requests show leads at 'onboarding' stage, Onboarding Requests show leads at 'signed_up' stage
  - "Move to Onboarding" button verifies a branch/merchant exists with the company name before allowing the move
  - Enhanced Hardware add form with all fields (serial, type, status, assigned to)
  - Added 3-dot menu actions (Edit, Reassign) on hardware table

- 2024-12-11: Invoice & Operations Enhancements
  - Invoice form now captures "Billed To" contact information
  - Multi-branch selection for invoices using checkboxes
  - PDF export includes billed_to_contact in Bill To section
  - Hardware tab enhanced with table display and bulk assignment functionality
  - Database: Added billed_to_contact column to invoices, created invoice_branches table

- 2024-12-11: Operations Dashboard & Merchant Terminology
  - Renamed "Vendors" to "Merchants" throughout the application
  - Added Operations page with 3 tabs: Hardware, Onboarding Requests, Signup Requests
  - Hardware management: register devices with serial numbers, assign to branches
  - Onboarding requests: configure Device Token, BHF ID, Server Address for new merchants/branches
  - Signup requests: show leads at "onboarding" stage with signup instructions
  - Added PDF export for invoices with Sensile Technologies logo
  - Created database tables: hardware, onboarding_requests
  - New API routes: /api/admin/operations/hardware, /api/admin/operations/onboarding, /api/admin/operations/signups
  - Navigation updated: /admin/merchants (was /admin/vendors), /admin/operations added

- 2024-12-11: Sales Team Authentication & Notifications
  - Added sales team login: email as username, full phone number (9+ digits) as password
  - Implemented strict RBAC: sales users can ONLY access /admin/sales page
  - Created notifications system with bell icon in header showing unread count
  - Notifications auto-created when invoices are raised (merchant-specific and global)
  - Invoice dialog now supports percentage discounts per line item
  - Widened invoice dialog to max-w-5xl to prevent horizontal scrolling
  - New API route: /api/admin/notifications (GET, POST, PUT)
  - New database table: notifications (user_id, type, title, message, is_read, reference_id)
  - Added discount column to invoice_line_items table

- 2024-12-11: Sales Management & Billing Enhancements
  - Added Sales Management page with 5-stage lead pipeline (Contact → Negotiation → Demo → Contracting → Onboarding)
  - Created sales team management with lead assignment and performance tracking
  - Added Products/Services configuration tab in Billing page for managing billable items
  - Changed invoice product selection from button grid to searchable dropdown for better UX
  - New API routes: /api/admin/sales-people, /api/admin/leads, /api/admin/billing-products

- 2024-12-10: Initial Replit environment setup
  - Configured Next.js for Replit proxy compatibility
  - Set up development workflow on port 5000
  - Added deployment configuration for autoscale
  - Migrated from external Supabase to local Replit PostgreSQL
  - Created Supabase-compatible wrapper for local database
  - Applied full database schema with all tables and indexes
  - Inserted sample data: 3 branches, 3 staff, 4 tanks, 4 dispensers, 4 fuel prices, 3 customers, 3 items
  - Created API routes for database access (/api/branches/list, /api/db/[table])
