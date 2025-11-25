-- Tambahkan kolom tanda tangan ke tabel rab_data yang sudah ada
ALTER TABLE public.rab_data
ADD COLUMN signature_kabid_umum text,
ADD COLUMN signature_bendahara_yayasan text,
ADD COLUMN signature_sekretaris_yayasan text,
ADD COLUMN signature_ketua_yayasan text,
ADD COLUMN signature_kepala_mta text;

-- Opsional: Jika Anda ingin memastikan kolom-kolom ini tidak null secara default,
-- Anda bisa menambahkan DEFAULT NULL atau mengubahnya nanti.
-- Untuk saat ini, biarkan saja agar tidak mengganggu data yang sudah ada.

-- Tidak perlu mengubah RLS policies atau triggers jika sudah diatur sebelumnya,
-- karena penambahan kolom tidak memengaruhi kebijakan yang sudah ada.