-- ============================================
-- ADD FOUNDATION TRACKING COLUMNS
-- Menambahkan kolom untuk tracking pengiriman laporan ke yayasan
-- ============================================

-- Tambah kolom di tabel tahfidz_supervisions
ALTER TABLE public.tahfidz_supervisions
ADD COLUMN IF NOT EXISTS sent_to_foundation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sent_to_foundation_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS sent_by uuid REFERENCES auth.users(id);

-- Tambah index untuk performa query
CREATE INDEX IF NOT EXISTS idx_supervisions_sent_to_foundation 
ON public.tahfidz_supervisions(sent_to_foundation, sent_to_foundation_at DESC);

-- Tambah comment untuk dokumentasi
COMMENT ON COLUMN public.tahfidz_supervisions.sent_to_foundation IS 'Status apakah laporan sudah dikirim ke yayasan';
COMMENT ON COLUMN public.tahfidz_supervisions.sent_to_foundation_at IS 'Timestamp kapan laporan dikirim ke yayasan';
COMMENT ON COLUMN public.tahfidz_supervisions.sent_by IS 'User ID yang mengirim laporan ke yayasan';

-- ============================================
-- DONE! Kolom tracking sudah ditambahkan
-- ============================================

-- Cara menggunakan:
-- 1. Copy script ini
-- 2. Buka Supabase Dashboard > SQL Editor
-- 3. Paste dan Run
-- 4. Verifikasi dengan query:
--    SELECT column_name, data_type 
--    FROM information_schema.columns 
--    WHERE table_name = 'tahfidz_supervisions' 
--    AND column_name LIKE 'sent%';
