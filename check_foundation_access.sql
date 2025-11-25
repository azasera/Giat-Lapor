-- ============================================
-- CEK AKSES FOUNDATION
-- ============================================

-- 1. Cek role user foundation
SELECT 
  u.id,
  u.email,
  p.username,
  p.role,
  p.updated_at,
  CASE 
    WHEN p.role = 'foundation' THEN '✅ Role BENAR - Seharusnya bisa lihat laporan'
    WHEN p.role = 'principal' THEN '❌ Role SALAH - Ubah ke foundation'
    WHEN p.role = 'admin' THEN '✅ Role ADMIN - Bisa lihat semua'
    ELSE '❌ Role TIDAK VALID: ' || COALESCE(p.role, 'NULL')
  END as status_role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at;

-- 2. Cek RLS Policy untuk Foundation
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  CASE 
    WHEN policyname = 'Foundation can view all reports.' THEN '✅ Policy Foundation ADA'
    ELSE policyname
  END as policy_status
FROM pg_policies
WHERE tablename = 'reports'
ORDER BY policyname;

-- 3. Test Query sebagai Foundation
-- Ini adalah query yang digunakan aplikasi
SELECT 
  r.id,
  r.principal_name,
  r.school_name,
  r.period,
  r.status,
  r.submitted_at,
  r.created_at
FROM reports r
WHERE r.status IN ('submitted', 'approved')
ORDER BY r.report_date DESC;

-- 4. Cek apakah ada user dengan role foundation
SELECT 
  COUNT(*) as jumlah_foundation,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Ada ' || COUNT(*) || ' user foundation'
    ELSE '❌ TIDAK ADA user foundation - Perlu dibuat'
  END as status
FROM profiles
WHERE role = 'foundation';

-- ============================================
-- SOLUSI: Set user sebagai foundation
-- ============================================

-- Jika Anda ingin set user tertentu sebagai foundation:
-- Ganti 'email@example.com' dengan email user foundation

-- UPDATE profiles 
-- SET role = 'foundation', updated_at = NOW()
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'email@example.com'
-- );

-- Atau set user pertama sebagai foundation (untuk testing):
-- UPDATE profiles 
-- SET role = 'foundation', updated_at = NOW()
-- WHERE id = (
--   SELECT id FROM profiles ORDER BY updated_at ASC LIMIT 1
-- );

-- ============================================
-- VERIFIKASI SETELAH UPDATE
-- ============================================

-- Setelah update role, jalankan ini untuk verifikasi:
SELECT 
  u.email,
  p.role,
  '✅ User ini sekarang bisa login sebagai Foundation' as status
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'foundation';
