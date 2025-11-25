-- ============================================
-- TEST MANUAL INSERT
-- ============================================

-- 1. Test insert dengan user ID dummy
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

-- 2. Lihat semua data
SELECT * FROM public.tahfidz_annual_schedules;

-- 3. Hapus data test
DELETE FROM public.tahfidz_annual_schedules 
WHERE institution_name = 'Test Manual Insert';

-- ============================================
-- Jika INSERT berhasil, berarti masalah di:
-- 1. Cache browser/API
-- 2. Atau kode frontend
-- ============================================
