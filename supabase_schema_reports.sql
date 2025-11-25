create table public.reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  report_date date not null,
  principal_name text not null,
  school_name text not null,
  period text not null,
  performance jsonb not null, -- Menyimpan PerformanceMetrics sebagai JSONB
  status text default 'draft'::text not null,
  submitted_at timestamp with time zone
);

alter table public.reports enable row level security;

create policy "Users can view their own reports."
  on public.reports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reports."
  on public.reports for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reports."
  on public.reports for update
  using (auth.uid() = user_id);

create policy "Users can delete their own reports."
  on public.reports for delete
  using (auth.uid() = user_id);

-- Kebijakan untuk foundation agar bisa melihat semua laporan
create policy "Foundation can view all reports."
  on public.reports for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'foundation'));