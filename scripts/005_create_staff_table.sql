-- Create staff table (drop and recreate to avoid conflicts)
DROP TABLE IF EXISTS staff CASCADE;

CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  role VARCHAR(50) NOT NULL CHECK (role IN ('Director', 'Manager', 'Supervisor', 'Cashier')),
  branch_id UUID REFERENCES branches(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Staff can view their own data" ON staff;
DROP POLICY IF EXISTS "Directors can view all staff" ON staff;
DROP POLICY IF EXISTS "Directors can insert staff" ON staff;
DROP POLICY IF EXISTS "Directors can update staff" ON staff;

-- Create policies
CREATE POLICY "Staff can view their own data" ON staff
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Directors can view all staff" ON staff
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND role = 'Director')
  );

CREATE POLICY "Directors can insert staff" ON staff
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND role = 'Director')
  );

CREATE POLICY "Directors can update staff" ON staff
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND role = 'Director')
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
