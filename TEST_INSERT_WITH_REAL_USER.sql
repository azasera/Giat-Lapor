-- ============================================
-- TEST INSERT DENGAN USER ID REAL
-- ============================================

-- Ganti 'YOUR-USER-ID' dengan user ID dari console log
-- (e4b197c3-cf85-4ee6-82e5-7dfd805d97b9)

INSERT INTO public.tahfidz_annual_schedules (
  year, 
  institution_name, 
  schedule_data, 
  created_by
)
VALUES (
  '2025',
  'Test With Real User ID',
  '[{"month":"Januari","teachers":["Test"]}]'::jsonb,
  'e4b197c3-cf85-4ee6-82e5-7dfd805d97b9'::uuid
)
RETURNING *;

-- Lihat semua data
SELECT * FROM public.tahfidz_annual_schedules;

-- Hapus test data
DELETE FROM public.tahfidz_annual_schedules 
WHERE institution_name = 'Test With Real User ID';
