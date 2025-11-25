-- ============================================
-- DEBUG JWT & POLICY EVALUATION
-- ============================================

-- 1. Cek current role dan JWT claims
SELECT 
  current_user as db_user,
  current_setting('request.jwt.claims', true) as jwt_claims,
  current_setting('request.jwt.claim.role', true) as jwt_role;

-- 2. Test policy evaluation dengan SET ROLE
SET ROLE authenticated;

-- 3. Test insert sebagai authenticated role
INSERT INTO public.tahfidz_annual_schedules (
  year, 
  institution_name, 
  schedule_data, 
  created_by
)
VALUES (
  '2025',
  'Test As Authenticated Role',
  '[]'::jsonb,
  'e4b197c3-cf85-4ee6-82e5-7dfd805d97b9'::uuid
)
RETURNING *;

-- 4. Reset role
RESET ROLE;

-- 5. Hapus test data
DELETE FROM public.tahfidz_annual_schedules 
WHERE institution_name = 'Test As Authenticated Role';

-- 6. Cek apakah ada policy yang conflict
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'tahfidz_annual_schedules'
ORDER BY policyname;

-- ============================================
-- Jika test insert sebagai authenticated role GAGAL,
-- berarti ada masalah dengan policy evaluation
-- ============================================
