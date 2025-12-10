-- Create hardware table for tracking devices assigned to branches
CREATE TABLE IF NOT EXISTS hardware (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  hardware_type VARCHAR(50) NOT NULL CHECK (hardware_type IN ('Controller', 'MiniPC', 'POS')),
  serial_number VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'retired')),
  assigned_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hardware ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Anyone can view hardware" ON hardware;
CREATE POLICY "Anyone can view hardware" ON hardware
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert hardware" ON hardware;
CREATE POLICY "Authenticated users can insert hardware" ON hardware
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update hardware" ON hardware;
CREATE POLICY "Authenticated users can update hardware" ON hardware
  FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete hardware" ON hardware;
CREATE POLICY "Authenticated users can delete hardware" ON hardware
  FOR DELETE USING (auth.uid() IS NOT NULL);
