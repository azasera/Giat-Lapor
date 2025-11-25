create table public.activities (
  id uuid default gen_random_uuid() primary key,
  report_id uuid references public.reports on delete cascade not null,
  category text not null,
  title text not null,
  description text,
  activity_date date, -- Menggunakan activity_date untuk menghindari konflik nama
  time text,
  location text,
  involved_parties text,
  participants integer,
  outcome text,
  islamic_value text,
  goals text,
  results text,
  impact text,
  challenges text,
  solutions text,
  follow_up_plan text,
  documentation_link text,
  attachment_link text,
  additional_notes text
);

alter table public.activities enable row level security;

create policy "Users can view activities of their own reports."
  on public.activities for select
  using (exists (select 1 from public.reports where id = report_id and user_id = auth.uid()));

create policy "Users can insert activities for their own reports."
  on public.activities for insert
  with check (exists (select 1 from public.reports where id = report_id and user_id = auth.uid()));

create policy "Users can update activities for their own reports."
  on public.activities for update
  using (exists (select 1 from public.reports where id = report_id and user_id = auth.uid()));

create policy "Users can delete activities from their own reports."
  on public.activities for delete
  using (exists (select 1 from public.reports where id = report_id and user_id = auth.uid()));

-- Kebijakan untuk foundation agar bisa melihat semua kegiatan
create policy "Foundation can view all activities."
  on public.activities for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'foundation'));