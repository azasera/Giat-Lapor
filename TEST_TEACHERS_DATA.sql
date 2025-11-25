-- ============================================
-- TEST: Tambah Data Guru untuk Testing
-- ============================================

-- Cek data yang ada
SELECT * FROM public.teachers;

-- Tambah beberapa guru untuk testing
INSERT INTO public.teachers (name) VALUES
  ('Ustadz Ahmad'),
  ('Ustadz Budi'),
  ('Ustadz Candra'),
  ('Ustadzah Dewi'),
  ('Ustadzah Eka')
ON CONFLICT DO NOTHING;

-- Verifikasi
SELECT 
  'SUCCESS! ' || COUNT(*) || ' guru ditambahkan' as status,
  id,
  name,
  created_at
FROM public.teachers
GROUP BY id, name, created_at
ORDER BY name;

-- ============================================
-- DONE! Sekarang refresh browser dan cek
-- ============================================
