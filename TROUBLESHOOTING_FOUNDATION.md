# 🔍 Troubleshooting: Laporan Tidak Muncul di Foundation

## ❓ Masalah
Laporan sudah dikirim dari akun Principal, tapi tidak muncul di akun Foundation.

---

## ✅ Checklist Diagnosa

Ikuti langkah-langkah ini secara berurutan:

### **1️⃣ Cek Status Laporan**

**Masalah:** Laporan masih berstatus **'draft'**, bukan **'submitted'**

**Cara Cek:**
1. Buka **Supabase Dashboard** → **SQL Editor**
2. Jalankan query ini:

```sql
SELECT 
  r.id,
  r.principal_name,
  r.status,
  r.submitted_at,
  CASE 
    WHEN r.status IN ('submitted', 'approved') THEN '✅ Terlihat Foundation'
    ELSE '❌ Tidak Terlihat (Status: ' || r.status || ')'
  END as visibility
FROM reports r
ORDER BY r.created_at DESC
LIMIT 10;
```

**Solusi jika status masih 'draft':**
```sql
-- Ubah status menjadi 'submitted'
UPDATE reports 
SET 
  status = 'submitted',
  submitted_at = NOW(),
  updated_at = NOW()
WHERE id = 'GANTI_DENGAN_ID_LAPORAN';
```

---

### **2️⃣ Cek Role User Foundation**

**Masalah:** User yang login tidak memiliki role **'foundation'**

**Cara Cek:**
```sql
SELECT 
  u.email,
  p.role,
  CASE 
    WHEN p.role = 'foundation' THEN '✅ Role Benar'
    ELSE '❌ Role Salah: ' || COALESCE(p.role, 'NULL')
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'EMAIL_FOUNDATION_ANDA@example.com';
```

**Solusi jika role salah:**
```sql
-- Ubah role menjadi 'foundation'
UPDATE profiles 
SET role = 'foundation', updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'EMAIL_FOUNDATION_ANDA@example.com'
);
```

**⚠️ PENTING:** Setelah mengubah role, user **HARUS logout dan login lagi!**

---

### **3️⃣ Cek RLS Policy**

**Masalah:** Policy untuk Foundation tidak ada atau tidak aktif

**Cara Cek:**
```sql
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'reports'
  AND policyname LIKE '%foundation%';
```

**Solusi jika policy tidak ada:**
```sql
-- Buat policy untuk Foundation
CREATE POLICY "Foundation can view all reports."
  ON public.reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'foundation'
  ));
```

---

### **4️⃣ Cek Apakah Ada Laporan Submitted**

**Cara Cek:**
```sql
SELECT 
  COUNT(*) as total_submitted,
  'Laporan ini SEHARUSNYA terlihat di Foundation' as catatan
FROM reports
WHERE status IN ('submitted', 'approved');
```

Jika hasilnya **0**, berarti memang belum ada laporan yang dikirim.

---

## 🚀 Quick Fix (Solusi Cepat)

Jika Anda yakin sudah mengirim laporan tapi tidak muncul, jalankan ini:

### **Step 1: Pastikan Status Submitted**
```sql
-- Lihat laporan yang masih draft
SELECT id, principal_name, status 
FROM reports 
WHERE status = 'draft';

-- Ubah semua draft menjadi submitted (jika sudah siap)
UPDATE reports 
SET 
  status = 'submitted',
  submitted_at = NOW(),
  updated_at = NOW()
WHERE status = 'draft';
```

### **Step 2: Pastikan Role Foundation Benar**
```sql
-- Cek dan update role foundation
UPDATE profiles 
SET role = 'foundation', updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'EMAIL_FOUNDATION@example.com'
);
```

### **Step 3: Logout & Login Lagi**
1. Logout dari aplikasi
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login lagi dengan akun Foundation
4. Refresh halaman

---

## 🔍 Verifikasi Setelah Fix

Jalankan query ini untuk memastikan semuanya sudah benar:

```sql
-- 1. Cek jumlah laporan per status
SELECT 
  status,
  COUNT(*) as jumlah
FROM reports
GROUP BY status;

-- 2. Cek laporan yang seharusnya terlihat
SELECT 
  r.id,
  r.principal_name,
  r.school_name,
  r.status,
  r.submitted_at
FROM reports r
WHERE r.status IN ('submitted', 'approved')
ORDER BY r.submitted_at DESC;

-- 3. Cek role foundation
SELECT 
  u.email,
  p.role
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'foundation';
```

---

## 📋 Checklist Lengkap

- [ ] Status laporan adalah **'submitted'** atau **'approved'** (bukan 'draft')
- [ ] User foundation memiliki role **'foundation'** di tabel profiles
- [ ] RLS Policy "Foundation can view all reports" sudah ada
- [ ] User foundation sudah **logout dan login lagi** setelah perubahan role
- [ ] Browser cache sudah di-clear
- [ ] Tidak ada error di browser console (F12)

---

## 🆘 Jika Masih Tidak Berhasil

### **Emergency Fix: Recreate All Policies**

```sql
-- 1. Drop semua policies
DROP POLICY IF EXISTS "Users can view their own reports." ON public.reports;
DROP POLICY IF EXISTS "Foundation can view all reports." ON public.reports;
DROP POLICY IF EXISTS "Admin can view all reports." ON public.reports;

-- 2. Recreate policies
CREATE POLICY "Users can view their own reports."
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Foundation can view all reports."
  ON public.reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'foundation'
  ));

CREATE POLICY "Admin can view all reports."
  ON public.reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 3. Ensure RLS is enabled
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
```

---

## 🎯 Cara Mengirim Laporan yang Benar

Dari aplikasi (sebagai Principal):

1. **Buat Laporan** → Isi semua data
2. **Simpan** → Status: 'draft'
3. **Kirim** → Klik tombol "Kirim ke Yayasan"
4. Status berubah menjadi **'submitted'**
5. Laporan sekarang **terlihat di Foundation**

---

## 💡 Tips

1. **Selalu cek status** laporan sebelum komplain tidak muncul
2. **Logout & login** setelah perubahan role
3. **Clear cache** jika ada masalah tampilan
4. **Cek console** browser (F12) untuk error messages
5. **Test dengan akun lain** untuk memastikan bukan masalah akun

---

## 📞 Bantuan Lebih Lanjut

Jika masih bermasalah setelah mengikuti semua langkah:

1. Screenshot error di browser console (F12)
2. Screenshot hasil query diagnosa
3. Catat email user foundation yang bermasalah
4. Hubungi developer/admin sistem

---

## 📝 Log Troubleshooting

Catat hasil troubleshooting Anda:

```
Tanggal: _______________
User Foundation: _______________
Masalah: _______________
Langkah yang sudah dicoba:
[ ] Cek status laporan
[ ] Cek role user
[ ] Cek RLS policy
[ ] Logout & login
[ ] Clear cache
[ ] Recreate policies

Hasil: _______________
```
