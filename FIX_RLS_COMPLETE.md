# 🔧 Fix Complete: RLS Policy untuk Reject RAB

## 🐛 **Error Baru:**
```
Error: Cannot coerce the result to a single JSON object
The result contains 0 rows
```

## 🎯 **Penyebab:**
RLS (Row Level Security) policy tidak mengizinkan **foundation** untuk UPDATE RAB. Query tidak mengembalikan data karena policy memblokir akses.

## ✅ **Solusi:**

### **Jalankan SQL ini di Supabase:**

```sql
-- Drop policy lama
DROP POLICY IF EXISTS "Foundation can update RAB for review" ON public.rab_data;
DROP POLICY IF EXISTS "Admin can update all RAB" ON public.rab_data;

-- Policy untuk Foundation UPDATE RAB
CREATE POLICY "Foundation can update RAB for review"
ON public.rab_data
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'foundation'
    )
    AND status = 'submitted'
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'foundation'
    )
);

-- Policy untuk Admin UPDATE semua RAB
CREATE POLICY "Admin can update all RAB"
ON public.rab_data
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
```

---

## 📋 **Langkah-Langkah:**

### **1. Buka Supabase SQL Editor**
- https://supabase.com/dashboard
- Pilih project Anda
- Klik "SQL Editor"

### **2. Copy-Paste SQL di atas**
- File: `QUICK_FIX_RLS_REJECT.sql`
- Atau copy dari kotak SQL di atas

### **3. Klik "Run"**

### **4. Verifikasi Output:**
```
status                          | policyname                           | cmd
SUCCESS! RLS policies updated   | Admin can update all RAB             | UPDATE
SUCCESS! RLS policies updated   | Foundation can update RAB for review | UPDATE
```

### **5. Refresh Browser**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### **6. Test Reject RAB**
- Login sebagai foundation
- Buka RAB dengan status "Dikirim"
- Isi catatan
- Klik "Tolak RAB"
- ✅ **Seharusnya berhasil!**

---

## 🔍 **Penjelasan Policy:**

### **Foundation Policy:**
```sql
USING: role = 'foundation' AND status = 'submitted'
WITH CHECK: role = 'foundation'
```
- Foundation hanya bisa UPDATE RAB dengan status **'submitted'**
- Ini mencegah foundation mengubah RAB draft atau yang sudah approved

### **Admin Policy:**
```sql
USING: role = 'admin'
WITH CHECK: role = 'admin'
```
- Admin bisa UPDATE semua RAB tanpa batasan
- Full access untuk troubleshooting

---

## 📊 **Summary Fix:**

### **Fix #1: Kolom reviewed_by** ✅
```sql
ALTER TABLE public.rab_data 
ADD COLUMN reviewed_by uuid;
```

### **Fix #2: RLS Policy** ✅
```sql
CREATE POLICY "Foundation can update RAB for review"
ON public.rab_data FOR UPDATE ...
```

---

## ✅ **Setelah Fix:**

**Foundation bisa:**
- ✅ Approve RAB (status: submitted → approved)
- ✅ Reject RAB (status: submitted → rejected)
- ✅ Menambahkan catatan review
- ✅ Tracking dengan `reviewed_by`

**Principal bisa:**
- ✅ Melihat status dan catatan
- ✅ Edit RAB yang ditolak
- ✅ Kirim ulang ke foundation

**Admin bisa:**
- ✅ Full access ke semua RAB
- ✅ Override semua policy
- ✅ Troubleshooting

---

## 🚨 **Troubleshooting:**

### **Q: Masih error setelah run SQL?**
**A:** 
1. Cek apakah policy sudah dibuat:
```sql
SELECT * FROM pg_policies WHERE tablename = 'rab_data' AND cmd = 'UPDATE';
```
2. Pastikan user foundation punya role 'foundation' di tabel profiles
3. Clear browser cache dan refresh

### **Q: Policy conflict error?**
**A:**
```sql
-- Hapus semua policy UPDATE untuk rab_data
DROP POLICY IF EXISTS "Foundation can update RAB for review" ON public.rab_data;
DROP POLICY IF EXISTS "Admin can update all RAB" ON public.rab_data;
DROP POLICY IF EXISTS "Users can update their own RAB" ON public.rab_data;

-- Lalu buat ulang policy yang benar
```

### **Q: Bagaimana cek role user?**
**A:**
```sql
SELECT id, username, role 
FROM public.profiles 
WHERE id = auth.uid();
```

---

## 📁 **File Terkait:**

- `QUICK_FIX_RLS_REJECT.sql` - SQL untuk copy-paste
- `fix_rab_rls_for_reject.sql` - SQL lengkap dengan verifikasi
- `FIX_RLS_COMPLETE.md` - Dokumentasi ini

---

## ✅ **Checklist:**

- [ ] SQL migration #1 (reviewed_by) sudah dijalankan
- [ ] SQL migration #2 (RLS policy) sudah dijalankan
- [ ] Policy "Foundation can update RAB for review" sudah dibuat
- [ ] Policy "Admin can update all RAB" sudah dibuat
- [ ] Browser sudah di-refresh
- [ ] Test reject RAB berhasil
- [ ] Status berubah menjadi "Ditolak"
- [ ] Catatan muncul di principal

---

**Jalankan SQL di atas untuk fix masalah RLS!** 🚀

**Version:** 1.1  
**Date:** 24 November 2025  
**Status:** ✅ Ready to Deploy
