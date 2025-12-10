-- Update staff table to link with Supabase auth
ALTER TABLE IF EXISTS staff
ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_login timestamp with time zone;

-- Enable RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Create policies for staff table
CREATE POLICY "Staff can view their own record"
  ON staff FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Directors can view all staff"
  ON staff FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.auth_user_id = auth.uid()
      AND staff.role = 'Director'
    )
  );

CREATE POLICY "Managers can view branch staff"
  ON staff FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.auth_user_id = auth.uid()
      AND (s.role = 'Manager' OR s.role = 'Director')
    )
  );
