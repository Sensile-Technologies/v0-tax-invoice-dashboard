# Flow360 - Business Management Dashboard

## Overview
Flow360 is a Next.js 16 business management application with features for sales, purchases, inventory, payments, customers, staff management, and reports. It appears to be designed for fuel station management with integration points for KRA (Kenya Revenue Authority) TIMS and Flow360 backend APIs.

## Tech Stack
- **Framework**: Next.js 16.0.7 with React 19
- **Styling**: Tailwind CSS 4.x with shadcn/ui components
- **Database**: Supabase (external service)
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

## Configuration
- Uses environment variables for Supabase connection
- Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for database connection
- Backend configuration in `/lib/backend-config.ts`

## Recent Changes
- 2024-12-10: Initial Replit environment setup
  - Configured Next.js for Replit proxy compatibility
  - Set up development workflow on port 5000
  - Added deployment configuration for autoscale
