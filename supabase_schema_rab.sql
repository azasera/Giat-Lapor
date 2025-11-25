-- Create rab_data table
CREATE TABLE public.rab_data (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    institution_name text NOT NULL,
    period text NOT NULL,
    year text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    
    -- New signature columns
    signature_kabid_umum text,
    signature_bendahara_yayasan text,
    signature_sekretaris_yayasan text,
    signature_ketua_yayasan text,
    signature_kepala_mta text
);

-- Create expense_items table
CREATE TABLE public.expense_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    rab_id uuid REFERENCES public.rab_data(id) ON DELETE CASCADE NOT NULL,
    type text NOT NULL, -- 'routine' or 'incidental'
    description text NOT NULL,
    volume numeric,
    unit text,
    unit_price numeric,
    amount numeric NOT NULL,
    source_of_fund text,
    estimated_week text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS) for rab_data
ALTER TABLE public.rab_data ENABLE ROW LEVEL SECURITY;

-- Policy for rab_data: Users can view and manage their own RABs
CREATE POLICY "Users can view their own rab_data."
  ON public.rab_data FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow foundation role to view all RABs
CREATE POLICY "Foundation can view all rab_data."
  ON public.rab_data FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'foundation'));

CREATE POLICY "Users can insert their own rab_data."
  ON public.rab_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rab_data."
  ON public.rab_data FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rab_data."
  ON public.rab_data FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Row Level Security (RLS) for expense_items
ALTER TABLE public.expense_items ENABLE ROW LEVEL SECURITY;

-- Policy for expense_items: Users can view and manage their own expense items
CREATE POLICY "Users can view their own expense_items."
  ON public.expense_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.rab_data WHERE id = rab_id AND user_id = auth.uid()));

-- Policy to allow foundation role to view all expense items
CREATE POLICY "Foundation can view all expense_items."
  ON public.expense_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'foundation'));

CREATE POLICY "Users can insert their own expense_items."
  ON public.expense_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.rab_data WHERE id = rab_id AND user_id = auth.uid()));

CREATE POLICY "Users can update their own expense_items."
  ON public.expense_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.rab_data WHERE id = rab_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.rab_data WHERE id = rab_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete their own expense_items."
  ON public.expense_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.rab_data WHERE id = rab_id AND user_id = auth.uid()));

-- Set up trigger to update 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rab_data_updated_at
BEFORE UPDATE ON public.rab_data
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_items_updated_at
BEFORE UPDATE ON public.expense_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();