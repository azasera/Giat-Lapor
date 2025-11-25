-- ============================================
-- MAKE created_by NULLABLE
-- ============================================

-- 1. Ubah kolom created_by jadi nullable
ALTER TABLE public.tahfidz_annual_schedules 
ALTER COLUMN created_by DROP NOT NULL;

-- 2. Verifikasi
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'tahfidz_annual_schedules'
AND column_name = 'created_by';

-- Harusnya menampilkan: is_nullable = YES

-- 3. Test insert tanpa created_by
INSERT INTO public.tahfidz_annual_schedules (
  year, 
  institution_name, 
  schedule_data
)
VALUES (
  '2025',
  'Test Without Created By',
  '[]'::jsonb
)
RETURNING *;

-- 4. Hapus test data
DELETE FROM public.tahfidz_annual_schedules 
WHERE institution_name = 'Test Without Created By';

-- ============================================
-- SELESAI! Sekarang created_by optional
-- ============================================
