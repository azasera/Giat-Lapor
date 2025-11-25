create table public.achievements (
  id uuid default gen_random_uuid() primary key,
  report_id uuid references public.reports on delete cascade not null,
  title text not null,
  description text,
  impact text,
  evidence text
);

alter table public.achievements enable row level security;

create policy "Users can view achievements of their own reports."
  on public.achievements for select
  using (exists (select 1 from public.reports where id = report_id and user_id = auth.uid()));

create policy "Users can insert achievements for their own reports."
  on public.achievements for insert
  with check (exists (select 1 from public.reports where id = report_id and user_id = auth.uid()));

create policy "Users can update achievements for their own reports."
  on public.achievements for update
  using (exists (select 1 from public.reports where id = report_id and user_id = auth.uid()));

create policy "Users can delete achievements from their own reports."
  on public.achievements for delete
  using (exists (select 1 from public.reports where id = report_id and user_id = auth.uid()));

-- Kebijakan untuk foundation agar bisa melihat semua prestasi
create policy "Foundation can view all achievements."
  on public.achievements for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'foundation'));