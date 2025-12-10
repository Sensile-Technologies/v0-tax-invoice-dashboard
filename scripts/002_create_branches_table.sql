-- Create branches table to store organization branches
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  manager TEXT,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'active'
  -- Removed user_id foreign key to avoid constraint violations
);

-- Enable Row Level Security
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Updated policies to allow viewing all branches
CREATE POLICY "Anyone can view branches"
  ON public.branches
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert branches"
  ON public.branches
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update branches"
  ON public.branches
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete branches"
  ON public.branches
  FOR DELETE
  USING (auth.uid() IS NOT NULL);
