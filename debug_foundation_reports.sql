-- ============================================
-- DEBUG: Laporan Tidak Muncul di Foundation
-- ============================================

-- 1. CEK STATUS LAPORAN
-- Lihat semua laporan dan statusnya
SELECT 
  r.id,
  u.email as pembuat,
  r.principal_name,
  r.school_name,
  r.period,
  r.status,
  r.submitted_at,
  r.created_at
FROM reports r
JOIN auth.users u ON r.user_id = u.id
ORDER BY r.created_at DESC;

-- 2. CEK LAPORAN YANG SEHARUSNYA TERLIHAT FOUNDATION
-- Foundation hanya melihat status 'submitted' dan 'approved'
SELECT 
  r.id,
  u.email as pembuat,
  r.principal_name,
  r.status,
  r.submitted_at,
  CASE 
    WHEN r.status IN ('submitted', 'approved') THEN '✅ Terlihat Foundation'
    ELSE '❌ Tidak Terlihat Foundation (Status: ' || r.status || ')'
  END as visibility_foundation
FROM reports r
JOIN auth.users u ON r.user_id = u.id
ORDER BY r.created_at DESC;

-- 3. CEK ROLE USER FOUNDATION
-- Pastikan user foundation memiliki role yang benar
SELECT 
  u.email,
  p.username,
  p.role,
  CASE 
    WHEN p.role = 'foundation' THEN '✅ Role Benar'
    ELSE '❌ Role Salah: ' || p.role
  END as role_status
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'foundation' OR u.email LIKE '%foundation%' OR u.email LIKE '%yayasan%';

-- 4. CEK LAPORAN DENGAN STATUS DRAFT
-- Ini tidak akan terlihat di foundation
SELECT 
  COUNT(*) as jumlah_draft,
  'Laporan dengan status draft tidak akan terlihat di Foundation' as catatan
FROM reports
WHERE status = 'draft';

-- 5. CEK LAPORAN YANG SUDAH SUBMITTED
SELECT 
  COUNT(*) as jumlah_submitted,
  'Laporan ini SEHARUSNYA terlihat di Foundation' as catatan
FROM reports
WHERE status = 'submitted';

-- 6. CEK LAPORAN YANG SUDAH APPROVED
SELECT 
  COUNT(*) as jumlah_approved,
  'Laporan ini SEHARUSNYA terlihat di Foundation' as catatan
FROM reports
WHERE status = 'approved';

-- 7. DETAIL LAPORAN YANG BARU DIKIRIM
-- Lihat 5 laporan terakhir yang dikirim
SELECT 
  r.id,
  u.email as pembuat,
  r.principal_name,
  r.school_name,
  r.status,
  r.submitted_at,
  r.created_at,
  r.updated_at
FROM reports r
JOIN auth.users u ON r.user_id = u.id
WHERE r.status IN ('submitted', 'approved')
ORDER BY r.submitted_at DESC NULLS LAST, r.created_at DESC
LIMIT 5;

-- ============================================
-- SOLUSI JIKA LAPORAN TIDAK MUNCUL
-- ============================================

-- MASALAH 1: Status masih 'draft'
-- SOLUSI: Update status menjadi 'submitted'
-- UPDATE reports 
-- SET status = 'submitted', 
--     submitted_at = NOW(),
--     updated_at = NOW()
-- WHERE id = 'GANTI_DENGAN_ID_LAPORAN';

-- MASALAH 2: Role user bukan 'foundation'
-- SOLUSI: Update role user
-- UPDATE profiles 
-- SET role = 'foundation'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'email_foundation@example.com');

-- MASALAH 3: RLS Policy bermasalah
-- CEK: Apakah foundation bisa query reports
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM reports WHERE status IN ('submitted', 'approved')
    ) THEN '✅ Foundation bisa query reports'
    ELSE '❌ Foundation tidak bisa query reports - Cek RLS Policy'
  END as rls_status;

-- ============================================
-- QUICK FIX: KIRIM ULANG LAPORAN
-- ============================================

-- Jika laporan sudah dibuat tapi belum terkirim (status masih draft)
-- Ubah status menjadi submitted:

-- UPDATE reports 
-- SET 
--   status = 'submitted',
--   submitted_at = NOW(),
--   updated_at = NOW()
-- WHERE status = 'draft' 
--   AND user_id = (SELECT id FROM auth.users WHERE email = 'email_principal@example.com');

-- ============================================
-- VERIFIKASI SETELAH FIX
-- ============================================

-- Setelah melakukan fix, jalankan query ini untuk verifikasi:
SELECT 
  r.id,
  u.email as pembuat,
  r.principal_name,
  r.status,
  r.submitted_at,
  'Laporan ini sekarang terlihat di Foundation' as status_visibility
FROM reports r
JOIN auth.users u ON r.user_id = u.id
WHERE r.status IN ('submitted', 'approved')
ORDER BY r.submitted_at DESC NULLS LAST;
