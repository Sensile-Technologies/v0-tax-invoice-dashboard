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
- 2024-12-11: UI and Workflow Enhancements
  - Changed admin top nav bar background to night sky blue (#0a1628)
  - Updated logo to use Flow360 circular logo image (public/flow360-logo.png)
  - Removed "Settings" text from nav, kept gear icon next to bell icon
  - Added notifications for recurring invoices that are due
  - Fixed Signup vs Onboarding workflow: Signup Requests show leads at 'onboarding' stage, Onboarding Requests show leads at 'signed_up' stage
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
