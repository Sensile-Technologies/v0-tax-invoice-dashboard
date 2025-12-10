# Shift Management Excel Upload System

## Overview
The shift management system allows branches to close shifts by uploading an Excel file containing nozzle meter readings and tank volumes. This can be done for individual branches or globally for all branches at once from headquarters.

## Features

### Branch-Level Shift Closing
- **Location**: Sales page → "End Shift (Excel Upload)" button
- **Process**:
  1. Click "End Shift (Excel Upload)" button (only available when a shift is active)
  2. Download the branch-specific Excel template
  3. Fill in the following columns:
     - Date
     - Shift
     - Nozzle ID
     - Nozzle Meter Reading (Litres)
     - Tank ID
     - Tank Volume (Litres)
  4. Upload the completed file
  5. The system will:
     - Update all nozzle meter readings
     - Update all tank stock levels
     - Close the active shift

### Global Shift Closing
- **Location**: Headquarters → Shift Management dropdown → "Global Shift Upload"
- **Process**:
  1. Click "Global Shift Upload" from the Shift Management dropdown
  2. Download the global template (contains one sheet per branch)
  3. Each sheet structure:
     - First row: Branch name
     - Second row: Column headers (Date, Shift, Nozzle ID, etc.)
     - Subsequent rows: Data for that branch
  4. Fill in data for all branches
  5. Upload the completed file
  6. The system will:
     - Process each branch sheet independently
     - Update nozzle readings and tank volumes for all branches
     - Close all active shifts across branches
     - Report success/errors for each branch

## File Structure

### Excel Template Format (Single Branch)
\`\`\`
| Date       | Shift | Nozzle ID                              | Nozzle Meter Reading (Litres) | Tank ID                                | Tank Volume (Litres) |
|------------|-------|----------------------------------------|-------------------------------|----------------------------------------|----------------------|
| 2024-01-15 | Day   | uuid-of-nozzle-1                       | 15420.5                       | uuid-of-tank-1                         | 8500.2              |
| 2024-01-15 | Day   | uuid-of-nozzle-2                       | 22150.8                       | uuid-of-tank-2                         | 6200.5              |
\`\`\`

### Excel Template Format (Global - Multiple Branches)
\`\`\`
Sheet 1: "Nairobi Branch"
Row 1: Nairobi Branch
Row 2: Date | Shift | Nozzle ID | Nozzle Meter Reading (Litres) | Tank ID | Tank Volume (Litres)
Row 3+: Data...

Sheet 2: "Mombasa Branch"
Row 1: Mombasa Branch
Row 2: Date | Shift | Nozzle ID | Nozzle Meter Reading (Litres) | Tank ID | Tank Volume (Litres)
Row 3+: Data...
\`\`\`

## API Endpoints

### POST /api/shifts/close-excel
Processes Excel uploads for shift closing.

**Request:**
- `file`: Excel file (.xlsx or .xls)
- `branchId`: Branch UUID or "global" for multi-branch upload

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Processed 3 branch(es)",
  "results": [
    {
      "branch": "Nairobi Branch",
      "shiftId": "uuid-of-shift",
      "updates": 8
    }
  ],
  "errors": []
}
\`\`\`

## Components

### ShiftManagementDialog
- **Location**: `components/shift-management-dialog.tsx`
- **Props**:
  - `open`: boolean
  - `onOpenChange`: (open: boolean) => void
  - `branchName`: string (optional)
  - `branchId`: string (optional)
- **Features**:
  - Template download button
  - File upload with validation
  - Progress indicator during upload

### GlobalShiftUploadDialog
- **Location**: `components/global-shift-upload-dialog.tsx`
- **Props**:
  - `open`: boolean
  - `onOpenChange`: (open: boolean) => void
- **Features**:
  - Fetches all active branches automatically
  - Generates multi-sheet template with one sheet per branch
  - Batch processes all branches in one upload
  - Detailed error reporting per branch

## Database Updates

When a shift is closed via Excel:

1. **Nozzles Table**: `initial_meter_reading` updated for each nozzle
2. **Tanks Table**: `current_stock` updated for each tank
3. **Shifts Table**: 
   - `status` changed to 'completed'
   - `end_time` set to current timestamp

## Usage Examples

### Branch Manager Closing a Shift
\`\`\`
1. Active shift is running at Nairobi Branch
2. Manager clicks "End Shift (Excel Upload)"
3. Downloads template: shift_close_template_Nairobi Branch.xlsx
4. Fills in 4 nozzle readings and 2 tank volumes
5. Uploads file
6. System confirms: "Shift closed successfully"
\`\`\`

### Headquarters Closing All Shifts
\`\`\`
1. Multiple branches have active shifts
2. HQ staff clicks "Shift Management" → "Global Shift Upload"
3. Downloads template: global_shift_close_template.xlsx (5 sheets for 5 branches)
4. Fills in data for all branches
5. Uploads file
6. System reports: "Successfully closed shifts for 5 branches"
\`\`\`

## Error Handling

The system provides detailed error messages for:
- Missing or invalid branch names
- No active shift found for a branch
- Invalid nozzle or tank IDs
- Database update failures
- File format issues

All errors are collected and reported back to the user without stopping the entire process.

## Security Considerations

- Only active shifts can be closed
- All database updates are atomic per branch
- File size limits are enforced
- Only Excel formats (.xlsx, .xls) are accepted
- Branch IDs are validated against the database
- RLS policies ensure data access control
