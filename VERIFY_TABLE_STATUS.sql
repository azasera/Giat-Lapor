-- ============================================
-- VERIFIKASI STATUS TABEL
-- ============================================

-- 1. Cek apakah tabel ada dan RLS status
SELECT 
  schemaname,
  tablename, 
  rowsecurity as rls_enabled,
  tableowner
FROM pg_tables 
WHERE tablename = 'tahfidz_annual_schedules';

-- 2. Cek semua policies (harusnya kosong atau tidak ada)
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'tahfidz_annual_schedules';

-- 3. Cek struktur kolom tabel
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'tahfidz_annual_schedules'
ORDER BY ordinal_position;

-- 4. Test insert manual (untuk memastikan tabel bisa di-insert)
-- Uncomment untuk test:
/*
INSERT INTO public.tahfidz_annual_schedules (
  year, 
  institution_name, 
  schedule_data, 
  created_by
)
VALUES (
  '2025',
  'Test Manual Insert',
  '[]'::jsonb,
  '00000000-0000-0000-0000-000000000000'::uuid
)
RETURNING *;
*/
