-- ============================================
-- CEK STATUS SETELAH FIX
-- ============================================

-- 1. Cek RLS status kedua tabel
SELECT 
  tablename, 
  rowsecurity as rls_enabled,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tahfidz_annual_schedules', 'teachers')
ORDER BY tablename;

-- 2. Cek jumlah guru di tabel teachers
SELECT COUNT(*) as total_teachers FROM public.teachers;

-- 3. Lihat 5 guru pertama
SELECT id, name, created_at 
FROM public.teachers 
ORDER BY name 
LIMIT 5;

-- 4. Cek apakah tabel annual schedules ada
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'tahfidz_annual_schedules'
) as table_exists;

-- 5. Cek struktur kolom tabel annual schedules
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'tahfidz_annual_schedules'
ORDER BY ordinal_position;

-- ============================================
-- HASIL YANG DIHARAPKAN:
-- 1. Kedua tabel: rls_enabled = false
-- 2. total_teachers > 0
-- 3. Muncul list guru
-- 4. table_exists = true
-- 5. Kolom: id, year, institution_name, schedule_data, created_by, created_at, updated_at
-- ============================================
