# Panduan Deploy Fitur Kirim ke Yayasan

## 🚀 Langkah-langkah Deploy

### 1. Pastikan Kode Sudah di Push
```bash
git status
git push origin master
```

### 2. Jalankan Migration di Database Production

Anda perlu menjalankan SQL migration di database Supabase production:

#### Cara 1: Via Supabase Dashboard (Recommended)
1. Buka https://supabase.com/dashboard
2. Pilih project Anda
3. Klik menu **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy-paste isi file `ADD_SENT_TO_FOUNDATION_COLUMN.sql`
6. Klik **Run** atau tekan `Ctrl + Enter`
7. Pastikan muncul pesan sukses

#### Cara 2: Via Supabase CLI
```bash
# Login ke Supabase
supabase login

# Link ke project
supabase link --project-ref YOUR_PROJECT_REF

# Jalankan migration
supabase db push
```

### 3. SQL Migration yang Perlu Dijalankan

```sql
-- Add sent_to_foundation_at column to memos table
ALTER TABLE memos 
ADD COLUMN IF NOT EXISTS sent_to_foundation_at TIMESTAMP WITH TIME ZONE;

-- Update existing memos with 'sent_to_foundation' status to have a timestamp
UPDATE memos 
SET sent_to_foundation_at = updated_at 
WHERE status = 'sent_to_foundation' AND sent_to_foundation_at IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN memos.sent_to_foundation_at IS 'Timestamp when memo was sent to foundation';
```

### 4. Verifikasi Migration Berhasil

Jalankan query ini untuk memastikan kolom sudah ditambahkan:

```sql
-- Check if column exists
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'memos' 
AND column_name = 'sent_to_foundation_at';

-- Should return:
-- column_name: sent_to_foundation_at
-- data_type: timestamp with time zone
-- is_nullable: YES
```

### 5. Deploy Aplikasi ke Vercel

Vercel akan otomatis deploy setelah push ke master. Atau manual:

```bash
# Install Vercel CLI jika belum
npm i -g vercel

# Deploy
vercel --prod
```

### 6. Verifikasi di Production

1. Buka https://giat-lapor.vercel.app
2. Login sebagai Principal atau Admin
3. Buka menu **Memo Internal**
4. Pastikan tombol **ikon Send (pesawat kertas)** muncul di kolom Aksi
5. Coba kirim satu memo ke yayasan
6. Verifikasi:
   - Status berubah menjadi "Dikirim ke Yayasan"
   - Tombol Send hilang
   - Memo tidak bisa diedit/hapus
7. Login sebagai Foundation
8. Pastikan memo yang dikirim muncul di daftar mereka

### 7. Troubleshooting

#### Tombol Send Tidak Muncul
- ✅ Pastikan migration sudah dijalankan di database production
- ✅ Hard refresh browser: `Ctrl + Shift + R`
- ✅ Clear cache browser
- ✅ Pastikan login sebagai Principal atau Admin (bukan Foundation)
- ✅ Pastikan memo belum berstatus "Dikirim ke Yayasan"

#### Error saat Kirim Memo
- ✅ Buka Developer Console (F12) untuk lihat error
- ✅ Pastikan kolom `sent_to_foundation_at` ada di database
- ✅ Pastikan Nomor Memo dan Perihal sudah diisi

#### Foundation Tidak Bisa Lihat Memo
- ✅ Pastikan memo sudah dikirim (status = 'sent_to_foundation')
- ✅ Pastikan user login sebagai role Foundation
- ✅ Refresh halaman

### 8. Rollback (Jika Diperlukan)

Jika ada masalah dan perlu rollback:

```sql
-- Remove column
ALTER TABLE memos 
DROP COLUMN IF EXISTS sent_to_foundation_at;

-- Reset status memos yang sudah dikirim
UPDATE memos 
SET status = 'final' 
WHERE status = 'sent_to_foundation';
```

## ✅ Checklist Deploy

- [ ] Kode sudah di-push ke master
- [ ] Migration SQL sudah dijalankan di production database
- [ ] Verifikasi kolom `sent_to_foundation_at` ada di database
- [ ] Vercel sudah auto-deploy atau manual deploy
- [ ] Test di production:
  - [ ] Tombol Send muncul
  - [ ] Bisa kirim memo ke yayasan
  - [ ] Status berubah menjadi "Dikirim ke Yayasan"
  - [ ] Memo terkunci (tidak bisa edit/hapus)
  - [ ] Foundation bisa lihat memo yang dikirim
- [ ] Informasikan user tentang fitur baru

## 📝 Catatan Penting

1. **Backup Database**: Selalu backup database sebelum menjalankan migration di production
2. **Test di Staging**: Jika ada environment staging, test dulu di sana
3. **Maintenance Window**: Jalankan migration saat traffic rendah
4. **Monitor**: Pantau error logs setelah deploy
5. **User Communication**: Informasikan user tentang fitur baru dan cara menggunakannya

## 🔗 Link Terkait

- Production: https://giat-lapor.vercel.app
- Supabase Dashboard: https://supabase.com/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Repository: (sesuaikan dengan repo Anda)

## 📞 Support

Jika ada masalah setelah deploy, segera:
1. Check error logs di Vercel
2. Check database logs di Supabase
3. Rollback jika diperlukan
4. Contact developer
