# Flow360 - Business Management Dashboard

## Overview
Flow360 is a Next.js 16 business management application for fuel station management. It provides comprehensive features for sales, purchases, inventory, payments, customer relationship management, staff administration, and reporting. A key capability is its integration with KRA (Kenya Revenue Authority) TIMS for regulatory compliance. The project aims to streamline operations and enhance efficiency for fuel station businesses, with modules for managing sales, purchases, inventory, payments, customers, and staff. It supports multi-vendor/branch operations and includes a mobile application for cashiers and supervisors.

## User Preferences
I want to develop this project iteratively. Please ask before making major architectural changes or introducing new libraries. I prefer clear and concise explanations for complex topics. I value clean, readable code and well-structured commit messages.

## System Architecture
The application is built on Next.js 16 with React 19, utilizing Tailwind CSS 4.x and shadcn/ui components for a modern and responsive user interface. Radix UI primitives are used for advanced UI elements. Data visualization is handled by Recharts, and form management uses React Hook Form with Zod for validation. The backend leverages a Replit PostgreSQL database. Authentication is custom, designed to be compatible with a Supabase-like client interface.

All frontend pages and components use `fetch()` calls to API endpoints (`/api/*`) for database operations, ensuring a clean separation between frontend and backend.

Key architectural decisions and features include:
- **Mobile Application**: An Expo React Native mobile app in the `/mobile` directory supports cashiers and supervisors.
- **Sales Pipeline Management**: A 5-stage lead pipeline (Contact → Negotiation → Demo → Contracting → Onboarding) with a specific signup workflow integrated with KRA PIN validation.
- **Notifications System**: In-app notifications for key events.
- **Hardware Management**: Functionality to register and assign hardware devices to branches.
- **Controller Logs & PTS Integration**: Real-time logging of pump transaction callbacks from PTS controllers, with `controller_id` mapping for routing transactions.
- **KRA Integration**: Centralized KRA URL Helper (`lib/kra-url-helper.ts`) for constructing server URLs and an "Initialize" feature for KRA configuration, with all requests and responses logged to `branch_logs`.
- **Catalog-Only Item Architecture**: Master product catalog managed at the headquarters level (`items` table), with branch-specific pricing and availability managed in `branch_items`. All pricing for sales, purchases, and KRA invoicing is sourced exclusively from `branch_items`.
- **Purchase Order Workflow**: Headquarters creates purchase orders requiring approval before becoming visible to branches for delivery acceptance and automatic stock updates.
- **Bulk Sales Management**: Automated calculation and KRA-compliant invoicing of fuel sold but not individually invoiced during a shift, with a configurable KRA intermittency rate for transmission.
- **Invoice Printing Workflow**: Differentiated printing for original invoices (once) and copies (watermarked).
- **End Shift & Reconciliation Workflow**: A two-phase process involving closing meter readings and assigning incoming attendants (Phase 1), followed by mandatory reconciliation for outgoing attendants with multi-payment attribution and banking summary (Phase 2). Includes tracking of shift expenses and banking activities.
- **Fuel Type & Sales Item_ID Migration**: Fuel type information is derived exclusively from the `items` table via `item_id`, ensuring a single source of truth. The `sales` table now uses `item_id` for all item references.
- **Item Color Codes**: `items` table includes `color_code` for chart visualization in Sales Summary.
- **Modular API Design**: API routes organized within the `/app` directory, with specific endpoints for mobile and administrative functions.
- **Security**: Session authentication uses httpOnly JSON cookies. Role-Based Access Control (RBAC) restricts access based on user roles (Cashiers, Supervisors, Managers, Directors, Vendors) with granular control over mobile app, branch access, and HQ dashboard features. HQ API endpoints are protected with server-side session validation and role checks.

## External Dependencies
- **Replit PostgreSQL**: Primary database.
- **KRA TIMS API**: Integration for tax compliance and fetching KRA-related data.
- **Expo React Native**: Used for developing the mobile application.
- **EAS (Expo Application Services)**: Used for building and configuring the mobile app APK.
- **Twilio WhatsApp API**: Used for sending DSSR (Daily Sales Summary Reports) to directors via WhatsApp when branches reconcile shifts. Configured via environment secrets (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER). Director phone numbers are stored in the `branches.whatsapp_directors` JSONB column and managed per-branch via Explore Tuzwa → Earning Rules tab.

## Loyalty Earning Rules
Loyalty points earning is configurable per-branch via Explore Tuzwa → Earning Rules tab. Two methods are supported:
- **Per Litre**: Points calculated as `quantity × points_per_litre`. Example: 50L × 2 points/litre = 100 points.
- **Per Amount Spent** (default): Points calculated as `floor(amount / threshold) × points_per_amount`. Example: KES 5000 / 100 threshold × 1 point = 50 points.

Configuration is stored in `branches` table columns: `loyalty_earn_type`, `loyalty_points_per_litre`, `loyalty_points_per_amount`, `loyalty_amount_threshold`. The amount threshold is always >= 1 to prevent division by zero.

## Loyalty Redemption Rules
Customers can redeem earned points for discounts. Redemption rules are configurable per-branch via Explore Tuzwa → Earning Rules tab:
- **Points per KES 1**: How many points are required for KES 1 discount. Example: 1 point = KES 1 discount.
- **Minimum Points to Redeem**: Customer must have at least this many points to redeem. Default: 100 points.
- **Max Discount Percentage**: Maximum percentage of transaction that can be covered by points. Default: 50%.

Configuration is stored in `branches` table columns: `redemption_points_per_ksh`, `min_redemption_points`, `max_redemption_percent`.

Mobile API endpoints:
- `GET /api/mobile/verify-loyalty` - Returns customer info, point balance, and redemption rules

**Bulk Redemption (Directors Only):**
Redemption is done from the web dashboard, not the mobile app. Directors/vendors can trigger bulk redemption for all eligible customers at once (e.g., monthly redemption).

Web API endpoints:
- `GET /api/loyalty/bulk-redeem` - Get all customers with point balances and eligibility status
- `POST /api/loyalty/bulk-redeem` - Process bulk redemption for all eligible customers

Workflow:
1. Director navigates to Explore Tuzwa → Bulk Redemption tab (only visible to directors/vendors)
2. Click "Load Eligible Customers" to see all customers with points above minimum threshold
3. Review summary: total customers, eligible count, total points, total value
4. Click "Redeem All Points" to process redemption for all eligible customers
5. System creates redemption transactions and clears all point balances

The `loyalty_transactions` table tracks both earning (`transaction_type='earn'`) and redemption (`transaction_type='redeem'`) with `points_earned` and `points_redeemed` columns respectively.

## Default Account Setup
All vendors automatically receive the following default accounts:
- **Expense Accounts**: "Petty Cash" (for petty cash expenses), "Genset" (for generator fuel and maintenance)
- **Banking Accounts**: "Cash Drop" (marked as default for shift banking activities)

Run `migrations/seed-default-accounts.sql` in production to seed these defaults for all existing vendors. New vendors will need these accounts created manually via the Accounting → Collections page.