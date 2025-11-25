-- ============================================
-- GRANT ALL PERMISSIONS
-- ============================================

-- Grant ke semua roles
GRANT ALL ON public.tahfidz_annual_schedules TO anon;
GRANT ALL ON public.tahfidz_annual_schedules TO authenticated;
GRANT ALL ON public.tahfidz_annual_schedules TO service_role;
GRANT ALL ON public.tahfidz_annual_schedules TO postgres;

-- Grant ke teachers table juga
GRANT ALL ON public.teachers TO anon;
GRANT ALL ON public.teachers TO authenticated;
GRANT ALL ON public.teachers TO service_role;
GRANT ALL ON public.teachers TO postgres;

-- Verifikasi permissions
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'tahfidz_annual_schedules'
ORDER BY grantee, privilege_type;

-- ============================================
-- SELESAI! Semua role punya akses penuh
-- ============================================
