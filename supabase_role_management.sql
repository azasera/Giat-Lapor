-- ============================================
-- ROLE MANAGEMENT HELPER QUERIES
-- ============================================
-- File ini berisi query-query untuk mengelola role user
-- Copy dan paste ke Supabase SQL Editor sesuai kebutuhan

-- ============================================
-- 1. MELIHAT DATA USER
-- ============================================

-- Lihat semua user dengan role mereka
SELECT 
  p.id,
  u.email,
  p.username,
  p.full_name,
  p.role,
  p.updated_at,
  u.created_at as registered_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY u.created_at DESC;

-- Lihat distribusi role
SELECT 
  role,
  COUNT(*) as jumlah_user
FROM public.profiles
GROUP BY role
ORDER BY jumlah_user DESC;

-- Lihat hanya admin
SELECT 
  u.email,
  p.username,
  p.full_name,
  p.role
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';

-- Lihat hanya foundation
SELECT 
  u.email,
  p.username,
  p.full_name,
  p.role
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'foundation';

-- Lihat hanya principal
SELECT 
  u.email,
  p.username,
  p.full_name,
  p.role
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'principal';

-- ============================================
-- 2. MENGUBAH ROLE USER
-- ============================================

-- TEMPLATE: Ubah role berdasarkan EMAIL
-- Ganti 'user@example.com' dengan email user yang ingin diubah
-- Ganti 'admin' dengan role yang diinginkan: 'principal', 'foundation', atau 'admin'
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);

-- TEMPLATE: Ubah role berdasarkan USERNAME
-- Ganti 'username_user' dengan username yang ingin diubah
UPDATE public.profiles
SET role = 'foundation', updated_at = NOW()
WHERE username = 'username_user';

-- ============================================
-- 3. SETUP AWAL (FIRST TIME SETUP)
-- ============================================

-- Jadikan user PERTAMA yang register sebagai ADMIN
-- Jalankan ini jika belum ada admin
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE id = (
  SELECT id FROM public.profiles 
  ORDER BY updated_at ASC 
  LIMIT 1
);

-- Atau jadikan user dengan email tertentu sebagai admin pertama
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@pesantren.com'
);

-- ============================================
-- 4. BULK UPDATE (MULTIPLE USERS)
-- ============================================

-- Ubah beberapa user sekaligus menjadi foundation
UPDATE public.profiles
SET role = 'foundation', updated_at = NOW()
WHERE username IN ('user1', 'user2', 'user3');

-- Ubah semua user dengan email domain tertentu
UPDATE public.profiles
SET role = 'foundation', updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@yayasan.com'
);

-- ============================================
-- 5. RESET ROLE
-- ============================================

-- Reset semua user ke principal (HATI-HATI!)
-- Uncomment jika benar-benar perlu
-- UPDATE public.profiles
-- SET role = 'principal', updated_at = NOW();

-- Reset role user tertentu ke principal
UPDATE public.profiles
SET role = 'principal', updated_at = NOW()
WHERE username = 'username_user';

-- ============================================
-- 6. VALIDASI & CLEANUP
-- ============================================

-- Cek user dengan role yang tidak valid
SELECT 
  u.email,
  p.username,
  p.role
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role NOT IN ('principal', 'foundation', 'admin');

-- Perbaiki role yang tidak valid (set ke principal)
UPDATE public.profiles
SET role = 'principal', updated_at = NOW()
WHERE role NOT IN ('principal', 'foundation', 'admin');

-- Cek user tanpa profile (seharusnya tidak ada)
SELECT 
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- ============================================
-- 7. CONTOH SKENARIO LENGKAP
-- ============================================

-- SKENARIO: Setup Pesantren Baru
-- 1. Admin IT
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'it@pesantren.com');

-- 2. Pihak Yayasan
UPDATE public.profiles
SET role = 'foundation', updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email IN (
    'yayasan1@pesantren.com',
    'yayasan2@pesantren.com'
  )
);

-- 3. Kepala Sekolah (Principal) - sudah otomatis saat register
-- Tidak perlu update, default role sudah 'principal'

-- ============================================
-- 8. MONITORING & AUDIT
-- ============================================

-- Lihat perubahan role terakhir (berdasarkan updated_at)
SELECT 
  u.email,
  p.username,
  p.role,
  p.updated_at as last_role_change
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.updated_at DESC
LIMIT 20;

-- Hitung total user per role
SELECT 
  role,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.profiles), 2) as percentage
FROM public.profiles
GROUP BY role
ORDER BY total DESC;

-- Cek apakah ada admin
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'Ada ' || COUNT(*) || ' admin'
    ELSE '⚠️ TIDAK ADA ADMIN! Segera set minimal 1 admin'
  END as status_admin
FROM public.profiles
WHERE role = 'admin';

-- ============================================
-- 9. EMERGENCY: PROMOTE SELF TO ADMIN
-- ============================================
-- Jika Anda terkunci dan tidak ada admin, gunakan ini
-- Ganti 'your_email@example.com' dengan email Anda

-- UPDATE public.profiles
-- SET role = 'admin', updated_at = NOW()
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'your_email@example.com'
-- );

-- ============================================
-- 10. BACKUP & RESTORE
-- ============================================

-- Backup role saat ini (simpan hasil query ini)
SELECT 
  p.id,
  u.email,
  p.username,
  p.role,
  p.updated_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY u.email;

-- TEMPLATE: Restore role dari backup
-- Sesuaikan dengan data backup Anda
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'user-id-1';
-- UPDATE public.profiles SET role = 'foundation' WHERE id = 'user-id-2';
-- UPDATE public.profiles SET role = 'principal' WHERE id = 'user-id-3';

-- ============================================
-- CATATAN PENTING:
-- ============================================
-- 1. Setelah mengubah role, user HARUS logout dan login lagi
-- 2. Role di-cache di session, tidak auto-refresh
-- 3. Selalu backup data sebelum bulk update
-- 4. Test di development dulu sebelum production
-- 5. Minimal harus ada 1 admin di sistem
-- ============================================
