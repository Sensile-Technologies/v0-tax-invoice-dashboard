-- Create fuel_prices table
CREATE TABLE IF NOT EXISTS fuel_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Petrol', 'Diesel', 'Kerosene', 'Super')),
  price DECIMAL(10, 2) NOT NULL,
  effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dispensers table
CREATE TABLE IF NOT EXISTS dispensers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  dispenser_number INTEGER NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Petrol', 'Diesel', 'Kerosene', 'Super')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(branch_id, dispenser_number)
);

-- Create nozzles table
CREATE TABLE IF NOT EXISTS nozzles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  dispenser_id UUID REFERENCES dispensers(id) ON DELETE CASCADE,
  nozzle_number INTEGER NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Petrol', 'Diesel', 'Kerosene', 'Super')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(branch_id, nozzle_number)
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  opening_cash DECIMAL(10, 2) DEFAULT 0,
  closing_cash DECIMAL(10, 2),
  total_sales DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  nozzle_id UUID REFERENCES nozzles(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  fuel_type TEXT NOT NULL,
  quantity DECIMAL(10, 3) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'mpesa', 'card', 'credit')),
  customer_name TEXT,
  vehicle_number TEXT,
  receipt_number TEXT,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE fuel_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispensers ENABLE ROW LEVEL SECURITY;
ALTER TABLE nozzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for fuel_prices
CREATE POLICY "Anyone can view fuel prices" ON fuel_prices FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert fuel prices" ON fuel_prices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update fuel prices" ON fuel_prices FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete fuel prices" ON fuel_prices FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS Policies for dispensers
CREATE POLICY "Anyone can view dispensers" ON dispensers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert dispensers" ON dispensers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update dispensers" ON dispensers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete dispensers" ON dispensers FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS Policies for nozzles
CREATE POLICY "Anyone can view nozzles" ON nozzles FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert nozzles" ON nozzles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update nozzles" ON nozzles FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete nozzles" ON nozzles FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS Policies for shifts
CREATE POLICY "Anyone can view shifts" ON shifts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert shifts" ON shifts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update shifts" ON shifts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete shifts" ON shifts FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS Policies for sales
CREATE POLICY "Anyone can view sales" ON sales FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert sales" ON sales FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update sales" ON sales FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete sales" ON sales FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_fuel_prices_branch ON fuel_prices(branch_id);
CREATE INDEX idx_dispensers_branch ON dispensers(branch_id);
CREATE INDEX idx_nozzles_branch ON nozzles(branch_id);
CREATE INDEX idx_nozzles_dispenser ON nozzles(dispenser_id);
CREATE INDEX idx_shifts_branch ON shifts(branch_id);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_sales_branch ON sales(branch_id);
CREATE INDEX idx_sales_shift ON sales(shift_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
