-- ============================================
-- DISABLE RLS UNTUK ANNUAL SCHEDULE
-- (Sementara untuk testing)
-- ============================================

-- Disable RLS
ALTER TABLE public.tahfidz_annual_schedules DISABLE ROW LEVEL SECURITY;

-- Sekarang coba simpan jadwal dari aplikasi web
-- Setelah berhasil, jalankan SQL di bawah untuk enable kembali:

/*
-- Enable RLS kembali
ALTER TABLE public.tahfidz_annual_schedules ENABLE ROW LEVEL SECURITY;

-- Hapus semua policy lama
DROP POLICY IF EXISTS "allow_all_for_authenticated" ON public.tahfidz_annual_schedules;

-- Buat policy yang benar
CREATE POLICY "allow_all_authenticated"
ON public.tahfidz_annual_schedules
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
*/
