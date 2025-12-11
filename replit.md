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
