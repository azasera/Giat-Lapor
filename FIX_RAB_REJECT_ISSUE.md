# 🔧 Fix: Yayasan Tidak Bisa Menolak RAB

## 🐛 **Masalah:**
```
Error rejecting RAB: Could not find the 'reviewed_by' column of 'rab_data' in the schema cache
```

## 🎯 **Penyebab:**
Kolom `reviewed_by` belum ada di tabel `rab_data` di database Supabase.

## ✅ **Solusi:**

### **Step 1: Jalankan SQL Migration**

1. **Buka Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Login dengan akun Anda

2. **Pilih Project**
   - Pilih project "Giat Lapor" atau project yang Anda gunakan

3. **Buka SQL Editor**
   - Klik menu "SQL Editor" di sidebar kiri
   - Atau klik icon ⚡ di sidebar

4. **Jalankan SQL**
   - Copy-paste SQL berikut:

```sql
-- Add reviewed_by column to rab_data table
ALTER TABLE public.rab_data 
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_rab_data_reviewed_by ON public.rab_data(reviewed_by);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'rab_data'
AND column_name = 'reviewed_by';
```

5. **Klik "Run"** atau tekan `Ctrl+Enter`

6. **Verifikasi**
   - Anda akan melihat output:
   ```
   column_name  | data_type | is_nullable
   reviewed_by  | uuid      | YES
   ```
   - Jika muncul, berarti berhasil! ✅

---

### **Step 2: Test Fitur Reject**

1. **Refresh Browser**
   - Tekan `Ctrl+Shift+R` (Windows) atau `Cmd+Shift+R` (Mac)
   - Atau tutup dan buka kembali aplikasi

2. **Login sebagai Yayasan**
   - Email: [email yayasan]
   - Password: [password]

3. **Buka RAB yang Dikirim**
   - Menu: RAB → Daftar RAB
   - Klik "Tampilkan RAB" pada RAB dengan status "Dikirim"

4. **Test Reject**
   - Scroll ke bawah ke bagian "Tinjauan Yayasan"
   - Isi catatan: "Mohon perbaiki item belanja nomor 3"
   - Klik "Tolak RAB"
   - ✅ Seharusnya berhasil!

5. **Verifikasi**
   - RAB status berubah menjadi "Ditolak"
   - Principal bisa melihat catatan penolakan
   - Principal bisa edit dan kirim ulang

---

## 📊 **Struktur Kolom Baru:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `reviewed_by` | uuid | YES | User ID yang mereview (approve/reject) RAB |

**Foreign Key:**
- References: `auth.users(id)`
- On Delete: SET NULL

**Index:**
- `idx_rab_data_reviewed_by` untuk performa query

---

## 🔍 **Troubleshooting:**

### **Q: SQL error saat menjalankan migration?**
**A:** Pastikan:
- Anda sudah login ke Supabase Dashboard
- Project yang dipilih sudah benar
- Anda memiliki permission untuk ALTER TABLE

### **Q: Masih error setelah migration?**
**A:** 
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh halaman (Ctrl+Shift+R)
3. Logout dan login kembali
4. Cek di Supabase Table Editor apakah kolom sudah ada

### **Q: Kolom sudah ada tapi masih error?**
**A:**
1. Cek RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'rab_data';
```
2. Pastikan policy mengizinkan UPDATE untuk foundation/admin

---

## 📝 **File Terkait:**

- `supabase_add_reviewed_by_column.sql` - SQL migration file
- `src/services/supabaseService.ts` - Fungsi approveRAB dan rejectRAB
- `src/pages/RABPage.tsx` - UI untuk approve/reject

---

## ✅ **Checklist:**

- [ ] SQL migration berhasil dijalankan
- [ ] Kolom `reviewed_by` muncul di tabel `rab_data`
- [ ] Index `idx_rab_data_reviewed_by` sudah dibuat
- [ ] Browser sudah di-refresh
- [ ] Test reject RAB berhasil
- [ ] Status RAB berubah menjadi "Ditolak"
- [ ] Principal bisa lihat catatan penolakan

---

## 🎉 **Selesai!**

Setelah menjalankan SQL migration di atas, fitur reject RAB akan berfungsi dengan baik.

**Yayasan sekarang bisa:**
- ✅ Menyetujui RAB (Approve)
- ✅ Menolak RAB (Reject) dengan catatan
- ✅ Tracking siapa yang mereview

**Principal akan:**
- ✅ Menerima notifikasi penolakan
- ✅ Melihat catatan dari yayasan
- ✅ Bisa edit dan kirim ulang RAB

---

**Version:** 1.0  
**Date:** 24 November 2025  
**Status:** ✅ Ready to Deploy
