# Flow360 - Business Management Dashboard

## Overview
Flow360 is a Next.js 16 business management application for fuel station management with features for sales, purchases, inventory, payments, customers, staff management, and reports. Includes integration points for KRA (Kenya Revenue Authority) TIMS.

## Tech Stack
- **Framework**: Next.js 16.0.7 with React 19
- **Styling**: Tailwind CSS 4.x with shadcn/ui components
- **Database**: Supabase (external service) + Replit PostgreSQL (local schema backup)
- **Authentication**: Supabase Auth
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation

## Project Structure
- `/app` - Next.js App Router pages and API routes
- `/components` - React components including UI primitives
- `/lib` - Utility functions, auth helpers, and API configurations
- `/hooks` - Custom React hooks
- `/public` - Static assets and images
- `/scripts` - SQL migration scripts

## Development
- **Dev Server**: `npm run dev` on port 5000
- **Build**: `npm run build`
- **Start**: `npm run start`

## Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Database Schema
The local Replit PostgreSQL database has the full schema with tables for:
- Users, Branches, Staff
- Fuel management (Tanks, Dispensers, Nozzles, Fuel Prices)
- Sales and Shifts
- Customers and Loyalty
- Items and Inventory
- KRA TIMS integration tables
- API logging

## Recent Changes
- 2024-12-10: Initial Replit environment setup
  - Configured Next.js for Replit proxy compatibility
  - Set up development workflow on port 5000
  - Added deployment configuration for autoscale
  - Created local PostgreSQL database with full schema
