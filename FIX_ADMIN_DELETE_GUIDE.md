# 🔧 Panduan Fix: Admin Tidak Bisa Menghapus

## ❌ **Masalah:**
Admin tidak bisa menghapus data (laporan, RAB, realisasi) meskipun tombol "Hapus" muncul.

---

## 🔍 **Root Cause:**
RLS (Row Level Security) Policy untuk DELETE hanya mengizinkan user menghapus data **mereka sendiri**:

```sql
-- Policy yang ada sekarang:
CREATE POLICY "Users can delete their own reports."
  ON public.reports FOR DELETE
  USING (auth.uid() = user_id);
```

**Masalah:** Policy ini **TIDAK** mengizinkan admin menghapus data user lain!

---

## ✅ **Solusi: Tambah Policy untuk Admin**

### **Step 1: Buka Supabase SQL Editor**
1. Login ke **Supabase Dashboard**
2. Klik **SQL Editor** di sidebar kiri
3. Klik **"New Query"**

### **Step 2: Copy & Paste Script Ini**

```sql
-- ============================================
-- FIX: Admin Delete Permission
-- ============================================

-- 1. Policy DELETE untuk REPORTS
CREATE POLICY "Admin can delete all reports."
  ON public.reports FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 2. Policy DELETE untuk RAB_DATA
CREATE POLICY "Admin can delete all rab_data."
  ON public.rab_data FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 3. Policy DELETE untuk RAB_REALIZATIONS
CREATE POLICY "Admin can delete all rab_realizations."
  ON public.rab_realizations FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 4. Policy DELETE untuk EXPENSE_ITEMS
CREATE POLICY "Admin can delete all expense_items."
  ON public.expense_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 5. Policy DELETE untuk REALIZATION_ITEMS
CREATE POLICY "Admin can delete all realization_items."
  ON public.realization_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 6. Policy DELETE untuk ACTIVITIES
CREATE POLICY "Admin can delete all activities."
  ON public.activities FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 7. Policy DELETE untuk ACHIEVEMENTS
CREATE POLICY "Admin can delete all achievements."
  ON public.achievements FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));
```

### **Step 3: Run Script**
1. Klik tombol **"Run"** atau tekan **Ctrl+Enter**
2. Tunggu sampai muncul "Success" untuk setiap policy
3. Jika ada error "policy already exists", skip saja (sudah ada)

### **Step 4: Verifikasi**
Jalankan query ini untuk memastikan policy sudah dibuat:

```sql
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE policyname LIKE '%Admin%'
ORDER BY tablename, cmd;
```

Hasilnya seharusnya:
```
| tablename           | policyname                          | cmd    |
|---------------------|-------------------------------------|--------|
| reports             | Admin can delete all reports.       | DELETE |
| rab_data            | Admin can delete all rab_data.      | DELETE |
| rab_realizations    | Admin can delete all rab_realizations. | DELETE |
| expense_items       | Admin can delete all expense_items. | DELETE |
| realization_items   | Admin can delete all realization_items. | DELETE |
| activities          | Admin can delete all activities.    | DELETE |
| achievements        | Admin can delete all achievements.  | DELETE |
```

### **Step 5: Logout & Login Lagi**
1. **Logout** dari aplikasi
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Login** lagi sebagai admin
4. **Test hapus data** → Seharusnya berhasil! ✅

---

## 🎯 **Cara Kerja Policy Baru:**

### **Sebelum Fix:**
```sql
-- Hanya bisa hapus jika user_id = auth.uid()
USING (auth.uid() = user_id)
```
- ✅ Principal bisa hapus data sendiri
- ❌ Admin **TIDAK** bisa hapus data user lain

### **Setelah Fix:**
```sql
-- Admin bisa hapus semua data
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
))
```
- ✅ Principal tetap bisa hapus data sendiri (policy lama)
- ✅ Admin **BISA** hapus semua data (policy baru)

---

## 🔍 **Troubleshooting:**

### **Problem 1: Error "policy already exists"**
**Solusi:** Policy sudah ada, skip saja. Lanjut ke policy berikutnya.

### **Problem 2: Masih tidak bisa hapus setelah run script**
**Solusi:**
1. Pastikan sudah **logout & login lagi**
2. Clear browser cache
3. Cek role admin:
```sql
SELECT u.email, p.role 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'email_admin@example.com';
```
4. Pastikan role = `admin` (huruf kecil)

### **Problem 3: Error saat run script**
**Solusi:**
1. Cek apakah tabel ada:
```sql
SELECT tablename FROM pg_tables 
WHERE tablename IN ('reports', 'rab_data', 'rab_realizations');
```
2. Jika tabel tidak ada, jalankan schema SQL dulu

### **Problem 4: Bisa hapus tapi error "cascade"**
**Solusi:** Tambah policy untuk tabel child (activities, achievements, expense_items, dll)

---

## 📊 **Test Setelah Fix:**

### **Test 1: Hapus Laporan**
1. Login sebagai admin
2. Buka menu "Laporan"
3. Pilih laporan user lain
4. Klik "Hapus"
5. Konfirmasi
6. ✅ Seharusnya berhasil terhapus

### **Test 2: Hapus RAB**
1. Buka menu "RAB"
2. Pilih RAB user lain
3. Klik "Hapus"
4. ✅ Seharusnya berhasil terhapus

### **Test 3: Hapus Realisasi**
1. Buka menu "Realisasi"
2. Pilih realisasi user lain
3. Klik "Hapus"
4. ✅ Seharusnya berhasil terhapus

---

## ⚠️ **Peringatan:**

1. **Backup Dulu!** 💾
   - Sebelum admin hapus data penting, backup dulu
   - Export ke CSV via Supabase Dashboard

2. **Tidak Ada Undo!** ❌
   - Data yang dihapus **PERMANEN**
   - Tidak bisa dikembalikan

3. **Cascade Delete!** 🔗
   - Hapus laporan → Activities & Achievements ikut terhapus
   - Hapus RAB → Expense Items & Realizations ikut terhapus

4. **Hati-hati!** ⚠️
   - Admin punya full power untuk hapus semua data
   - Pastikan hanya user terpercaya yang punya role admin

---

## 🎓 **Penjelasan Teknis:**

### **RLS (Row Level Security):**
- Security di database level
- Mengontrol siapa bisa akses data apa
- Lebih aman dari security di aplikasi level

### **Policy:**
- Rule yang menentukan akses data
- Bisa berbeda untuk SELECT, INSERT, UPDATE, DELETE
- Bisa kombinasi multiple policies (OR logic)

### **USING Clause:**
- Kondisi yang harus TRUE untuk akses data
- Jika FALSE, data tidak bisa diakses
- Bisa query ke tabel lain (seperti profiles)

### **EXISTS:**
- Cek apakah ada row yang match kondisi
- Lebih efisien dari COUNT(*) > 0
- Return TRUE/FALSE

---

## 📝 **Checklist:**

- [ ] Buka Supabase SQL Editor
- [ ] Copy & paste script fix
- [ ] Run script (Ctrl+Enter)
- [ ] Verifikasi policy sudah dibuat
- [ ] Logout dari aplikasi
- [ ] Clear browser cache
- [ ] Login lagi sebagai admin
- [ ] Test hapus data
- [ ] ✅ Berhasil!

---

## 🆘 **Jika Masih Bermasalah:**

Kirim hasil query ini:

```sql
-- 1. Cek policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'reports';

-- 2. Cek role admin
SELECT u.email, p.role
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';

-- 3. Cek RLS aktif
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'reports';
```

---

Setelah menjalankan fix ini, admin seharusnya bisa menghapus semua data! 🎉
