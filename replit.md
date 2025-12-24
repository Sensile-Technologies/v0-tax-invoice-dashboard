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
- **Sales Pipeline Management**: A 5-stage lead pipeline for sales teams, including lead assignment and performance tracking. **Signup validation** - the public signup page validates KRA PIN and phone number against the leads table. If the submitted details don't match any entry in the sign up request list, users see a "contact admin" error.
- **Notifications System**: In-app notifications for key events like due invoices.
- **Hardware Management**: Functionality to register and assign hardware devices to branches.
- **Controller Logs & PTS Integration**: Real-time logging of pump transaction callbacks from PTS controllers, with summary statistics and detailed payload viewing.
- **Fuel Grade Mapping**: Map pump controller fuel grade IDs to inventory items for automated sales processing. Supports global or controller-specific mappings.
- **Supplier/Transporter Management**: Manage suppliers and transporters via headquarters interface with full CRUD operations and server-side vendor scoping.
- **Purchase Order Workflow**: HQ creates purchase orders via a full-page form with mandatory supplier, unit prices, and optional transporter/transport cost, vehicle registration, and driver details. Orders require approval by a Manager or Director at HQ before becoming visible to branches. Rejected orders include comments. Branches accept deliveries by capturing tank volumes (before/after), dispenser readings (before/after), bowser volume, and dips. Variance is calculated as: ((Tank Volume After - Before) + (Dispenser Readings After - Before)) - Bowser Volume. Upon acceptance, tank stock positions are automatically updated to the volume_after values.
- **Modular API Design**: API routes are organized within the `/app` directory, with specific endpoints for mobile and administrative functions.

## Security Notes
- **Session Authentication**: The `user_session` cookie is currently unsigned JSON. API endpoints that require vendor scoping derive the vendor_id server-side from the session rather than trusting client input. Future enhancement: implement signed/encrypted cookies or server-side sessions for stronger security.

## External Dependencies
- **Replit PostgreSQL**: The primary database, auto-configured via `DATABASE_URL`.
- **KRA TIMS API**: External API integration for tax compliance, specifically for `trnsSales/saveSales` and endpoints for fetching KRA codes and item classifications.
- **Expo React Native**: Used for the mobile application development in the `/mobile` directory.
- **EAS (Expo Application Services)**: For building and configuring the mobile app APK.