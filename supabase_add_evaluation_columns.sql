ALTER TABLE public.reports
ADD COLUMN principal_evaluation jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.reports
ADD COLUMN foundation_evaluation jsonb DEFAULT '{}'::jsonb;