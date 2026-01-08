# Flow360 - Business Management Dashboard

## Overview
Flow360 is a Next.js 16 business management application designed for fuel station management. It provides comprehensive features for sales, purchases, inventory, payments, customer relationship management, staff administration, and reporting. A key capability is its integration with KRA (Kenya Revenue Authority) TIMS for regulatory compliance. The project aims to streamline operations and enhance efficiency for fuel station businesses.

## User Preferences
I want to develop this project iteratively. Please ask before making major architectural changes or introducing new libraries. I prefer clear and concise explanations for complex topics. I value clean, readable code and well-structured commit messages.

## System Architecture
The application is built on Next.js 16 with React 19, utilizing Tailwind CSS 4.x and shadcn/ui components for a modern and responsive user interface. Radix UI primitives are used for advanced UI elements. Data visualization is handled by Recharts, and form management is implemented using React Hook Form with Zod for validation.

The backend leverages a Replit PostgreSQL database. Authentication is custom, designed to be compatible with a Supabase-like client interface but implemented against the local PostgreSQL.

**Data Access Architecture**: All frontend pages and components use fetch() calls to API endpoints (`/api/*`) for database operations. Direct Supabase client usage is restricted to server-side API routes only. This ensures a clean separation between frontend and backend, improves security, and allows for better API rate limiting and caching.

Key features include:
- **Comprehensive Business Management**: Modules for sales, purchases, inventory, payments, customers, and staff.
- **KRA TIMS Integration**: Dedicated features and tables for compliance with Kenya Revenue Authority Tax Invoice Management System.
- **Mobile Application**: An Expo React Native mobile app in the `/mobile` directory supports cashiers and supervisors with functionalities like login, dashboard, invoice creation, and history.
- **Multi-Vendor/Branch Support**: The system is designed to manage multiple branches and vendors with appropriate security and data isolation.
- **Loyalty & Discount System**: Integrated features for managing customer loyalty points and applying discounts to sales.
- **Sales Pipeline Management**: A 5-stage lead pipeline (Contact → Negotiation → Demo → Contracting → Onboarding) for sales teams, including lead assignment and performance tracking. **Signup workflow**: Leads in the "onboarding" stage appear in Admin > Operations > Sign Up Requests. The public signup page validates KRA PIN ONLY against leads in the "onboarding" stage. If no match, users see a "contact admin" error. Upon successful signup, the lead moves to "pending_activation" (disappears from both sales pipeline and sign up requests), and the newly created branch appears in Admin > Operations > Onboarding Requests where admin must configure device_token and bhf_id before the vendor can log in.
- **Notifications System**: In-app notifications for key events like due invoices.
- **Hardware Management**: Functionality to register and assign hardware devices to branches.
- **Controller Logs & PTS Integration**: Real-time logging of pump transaction callbacks from PTS controllers, with summary statistics and detailed payload viewing. Server IP (143.244.220.194) displayed for controller configuration.
- **Branch Controller ID Mapping**: Branches can be assigned a `controller_id` (same as PTS ID from pump controllers) to automatically match incoming pump callbacks. Configurable via HQ create branch dialog or Admin onboarding dialog (labeled as "PTS ID"). The pump-callback endpoint uses `controller_id` to route transactions to the correct branch.
- **Centralized KRA URL Helper**: All KRA API calls use `lib/kra-url-helper.ts` with `buildKraBaseUrl()` to safely construct server URLs from branch-level configuration. The helper handles addresses with/without schemes, embedded ports, and trailing slashes.
- **KRA Initialize**: "Initialize" button available in Admin > Merchants branch edit dialog and Admin > Operations > Onboarding config dialog. Calls `/initializer/selectInitInfo` endpoint with payload `{ tin, bhfId, dvcSrlNo }`. All requests and responses are logged to the `branch_logs` table, scoped per branch.
- **Branch Logs**: API endpoint `/api/branches/[id]/logs` returns logs for a specific branch. Logs are isolated per branch - users can only see logs for branches they have access to.
- **Fuel Grade Mapping**: Map pump controller fuel grade IDs to inventory items for automated sales processing. Supports global or controller-specific mappings.
- **Supplier/Transporter Management**: Manage suppliers and transporters via headquarters interface with full CRUD operations and server-side vendor scoping.
- **Purchase Order Workflow**: HQ creates purchase orders via a full-page form with mandatory supplier, unit prices, and optional transporter/transport cost, vehicle registration, and driver details. Orders require approval by a Manager or Director at HQ before becoming visible to branches. Rejected orders include comments. Branches accept deliveries by capturing tank volumes (before/after), dispenser readings (before/after), bowser volume, and dips. Variance is calculated as: ((Tank Volume After - Before) + (Dispenser Readings After - Before)) - Bowser Volume. Upon acceptance, tank stock positions are automatically updated to the volume_after values.
- **Catalog-Only Item Architecture**: Items are managed exclusively at vendor headquarters level. The `items` table stores the master product catalog (branch_id = NULL always). Legacy item creation (with branch_id) is blocked by the API. The workflow is: (1) HQ creates items in the vendor catalog via `/api/headquarters/items`, (2) HQ assigns items to branches via "Assign to Branch" which creates `branch_items` entries with branch-specific pricing. All nozzles, tanks, and sales reference items via `item_id`. The `branch_items` table is the single source of truth for pricing (sale_price, purchase_price) and availability (is_available). KRA code mappings: Item Types use cd_cls '24' (1=Raw Material, 2=Finished Product, 3=Service), Origins use cd_cls '12'.
- **Branch Items as Single Source of Truth for Pricing**: All pricing is stored in the `branch_items` table (branch-specific `sale_price` and `purchase_price`). The legacy `fuel_prices` table and `items.sale_price`/`items.purchase_price` columns have been REMOVED. All API endpoints (KRA invoicing, mobile sales, shifts, imports) now exclusively use `branch_items` prices with no fallback to the items table. If a branch doesn't have a configured price for an item, sales will fail with a clear error message prompting the user to configure the price in Inventory Management.
- **Pump Callback Pricing Requirements**: Automated pump sales via `/api/pump-callback` require: (1) Branch must have `controller_id` (PTS ID) configured to match the incoming PtsId, (2) Items must have pricing configured in `branch_items` for that branch. If either is missing, the sale will be logged but not created, with clear error messages indicating the configuration issue.
- **Bulk Sales**: Fuel sold but not individually invoiced during a shift. Formula: `Bulk Sales = (Closing Reading - Opening Reading) - Invoiced Quantity`. The `bulk_sales` table stores per-nozzle calculations (opening/closing readings, meter difference, invoiced quantity, bulk quantity, unit price, total amount). During shift closure, the system calculates meter differences and generates KRA-compliant invoices automatically. Generated invoices are stored in the `sales` table with `source_system = 'meter_diff_bulk'` and `is_automated = true`. Amounts are split into denominations (KES 100-2,500) for KRA compliance. The HQ dashboard shows bulk sales statistics per branch (count, volume, amount) in the Performance Analytics section.
- **Fuel Type from Items Table**: The `fuel_type` columns have been removed from `nozzles` and `tanks` tables. All fuel type information is now derived exclusively from the `items` table via `item_id`. This ensures a single source of truth for fuel names. All nozzles and tanks must have a valid `item_id` linking to the items catalog.
- **Modular API Design**: API routes are organized within the `/app` directory, with specific endpoints for mobile and administrative functions.

## Security Notes
- **Session Authentication**: The `user_session` cookie is httpOnly JSON containing user id, email, vendor_id, and branch_id. API endpoints derive identity from this server-side cookie rather than trusting client input. Future enhancement: implement signed/encrypted cookies for tamper protection.
- **Role-Based Access Control**:
  - **Cashiers**: Can ONLY access the mobile APK app. Web dashboard login is blocked with a 403 error.
  - **Supervisors & Managers**: Can only access their assigned branch. Branch switching is disabled, HQ access is blocked at both client (loading screen + redirect) and server level (API returns 403). Each supervisor/manager is assigned to exactly one branch.
  - **Directors & Vendors**: Full access to all branches and HQ dashboard.
- **HQ API Protection**: The `/api/headquarters/stats` endpoint uses server-side session validation and returns 401 for unauthenticated requests, 403 for restricted roles. Role is queried from the database, not trusted from client.

## External Dependencies
- **Replit PostgreSQL**: The primary database, auto-configured via `DATABASE_URL`.
- **KRA TIMS API**: External API integration for tax compliance, specifically for `trnsSales/saveSales` and endpoints for fetching KRA codes and item classifications.
- **Expo React Native**: Used for the mobile application development in the `/mobile` directory.
- **EAS (Expo Application Services)**: For building and configuring the mobile app APK.