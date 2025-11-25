-- Create rab_realizations table
CREATE TABLE public.rab_realizations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    rab_id uuid REFERENCES public.rab_data(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status text NOT NULL DEFAULT 'in_progress',
    t otal_planned numeric NOT NULL DEFAULT 0,
    total_actual numeric NOT NULL DEFAULT 0,
    variance numeric NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    submitted_at timestamp with time zone,
    approved_at timestamp with time zone
);

-- Create realization_items table
CREATE TABLE public.realization_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    realization_id uuid REFERENCES public.rab_realizations(id) ON DELETE CASCADE NOT NULL,
    expense_item_id uuid REFERENCES public.expense_items(id) ON DELETE CASCADE NOT NULL,
    description text NOT NULL,
    planned_amount numeric NOT NULL,
    actual_amount numeric NOT NULL DEFAULT 0,
    actual_date date,
    receipt text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.rab_realizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realization_items ENABLE ROW LEVEL SECURITY;

-- Policies for rab_realizations
CREATE POLICY "Users can view their own realizations."
  ON public.rab_realizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Foundation can view all realizations."
  ON public.rab_realizations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'foundation'));

CREATE POLICY "Users can insert their own realizations."
  ON public.rab_realizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own realizations."
  ON public.rab_realizations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own realizations."
  ON public.rab_realizations FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for realization_items
CREATE POLICY "Users can view their own realization items."
  ON public.realization_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.rab_realizations WHERE id = realization_id AND user_id = auth.uid()));

CREATE POLICY "Foundation can view all realization items."
  ON public.realization_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'foundation'));

CREATE POLICY "Users can insert their own realization items."
  ON public.realization_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.rab_realizations WHERE id = realization_id AND user_id = auth.uid()));

CREATE POLICY "Users can update their own realization items."
  ON public.realization_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.rab_realizations WHERE id = realization_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.rab_realizations WHERE id = realization_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete their own realization items."
  ON public.realization_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.rab_realizations WHERE id = realization_id AND user_id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_rab_realizations_updated_at
BEFORE UPDATE ON public.rab_realizations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_realization_items_updated_at
BEFORE UPDATE ON public.realization_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
