-- Migration: Add outgoing_attendant_id to shift_readings
-- Date: 2026-01-18
-- Description: Adds outgoing_attendant_id column to track which attendant was operating
--              the nozzle during the shift being closed. This enables automatic population
--              of outgoing attendants based on the previous shift's incoming attendants.

-- Add outgoing_attendant_id column to shift_readings
ALTER TABLE shift_readings 
ADD COLUMN IF NOT EXISTS outgoing_attendant_id UUID REFERENCES staff(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shift_readings_outgoing_attendant 
ON shift_readings(outgoing_attendant_id);

-- Backfill: Copy incoming_attendant_id to outgoing_attendant_id for existing records
-- This maintains backward compatibility for shifts that were created before this migration
UPDATE shift_readings 
SET outgoing_attendant_id = incoming_attendant_id 
WHERE outgoing_attendant_id IS NULL AND incoming_attendant_id IS NOT NULL;
