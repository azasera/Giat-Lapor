-- ============================================
-- DIAGNOSIS DAN FIX RLS - JADWAL TAHUNAN
-- ============================================
-- Jalankan query ini satu per satu untuk mendiagnosis masalah

-- STEP 1: Cek apakah user memiliki profile dan role yang benar
-- Ganti 'USER_EMAIL_HERE' dengan email user yang bermasalah
SELECT 
  u.id as user_id,
  u.email,
  p.id as profile_id,
  p.role,
  p.username,
  p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'USER_EMAIL_HERE';  -- GANTI DENGAN EMAIL USER

-- STEP 2: Jika user tidak memiliki profile atau role salah, buat/update profile
-- Ganti 'USER_ID_HERE' dengan ID user dari query di atas
-- Ganti 'principal' dengan role yang sesuai (principal atau admin)
/*
INSERT INTO public.profiles (id, role, username, full_name)
VALUES (
  'USER_ID_HERE',  -- GANTI DENGAN USER ID
  'principal',     -- GANTI DENGAN ROLE: 'principal' atau 'admin'
  'username',      -- GANTI DENGAN USERNAME
  'Full Name'      -- GANTI DENGAN NAMA LENGKAP
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = EXCLUDED.role,
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name;
*/

-- STEP 3: Cek RLS policies yang ada
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'tahfidz_annual_schedules'
ORDER BY cmd, policyname;

-- STEP 4: Test apakah user bisa insert (sebagai user yang login)
-- Jalankan ini setelah login sebagai user yang bermasalah
/*
SELECT 
  auth.uid() as current_user_id,
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'principal'
  ) as has_principal_role,
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) as has_admin_role;
*/

-- STEP 5: Jika masih error, temporary disable RLS untuk testing
-- HATI-HATI: Ini hanya untuk testing, jangan lupa enable kembali!
/*
ALTER TABLE public.tahfidz_annual_schedules DISABLE ROW LEVEL SECURITY;
*/

-- STEP 6: Setelah testing berhasil, enable kembali RLS
/*
ALTER TABLE public.tahfidz_annual_schedules ENABLE ROW LEVEL SECURITY;
*/

-- STEP 7: Solusi permanen - Recreate policies dengan kondisi yang lebih baik
-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Principal can insert annual schedules" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "Admin can insert annual schedules" ON public.tahfidz_annual_schedules;

-- Recreate dengan single policy yang lebih sederhana
CREATE POLICY "Authorized users can insert annual schedules"
  ON public.tahfidz_annual_schedules FOR INSERT
  WITH CHECK (
    -- User harus login
    auth.uid() IS NOT NULL
    AND
    -- User harus memiliki role principal atau admin
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('principal', 'admin')
    )
  );

-- STEP 8: Verifikasi policy baru
SELECT 
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'tahfidz_annual_schedules'
AND cmd = 'INSERT';
