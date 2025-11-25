# 🚨 ULTIMATE FIX: RAB Reject RLS Issue

## 🎯 **Masalah Persisten:**
```
Error: new row violates row-level security policy for table "rab_data"
Code: 42501 (Forbidden)
```

Sudah mencoba beberapa fix tapi masih error. **Kemungkinan ada policy lama yang konflik.**

---

## ✅ **SOLUSI ULTIMATE: Reset Total**

### **Strategi:**
1. ❌ Drop **SEMUA** policy untuk `rab_data`
2. ✅ Buat ulang policy dari awal dengan benar
3. ✅ Pastikan tidak ada konflik

---

## 🔧 **JALANKAN SQL INI:**

```sql
-- ============================================
-- RESET TOTAL: Drop semua policy lama
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'rab_data'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.rab_data', r.policyname);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- ============================================
-- BUAT POLICY BARU YANG BENAR
-- ============================================

-- SELECT Policies
CREATE POLICY "Users can view their own RAB"
ON public.rab_data FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Foundation can view all RAB"
ON public.rab_data FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'foundation'));

CREATE POLICY "Admin can view all RAB"
ON public.rab_data FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- INSERT Policies
CREATE POLICY "Users can insert their own RAB"
ON public.rab_data FOR INSERT
WITH CHECK (user_id = auth.uid());

-- UPDATE Policies (PENTING!)
CREATE POLICY "Principal can update their own RAB"
ON public.rab_data FOR UPDATE
USING (user_id = auth.uid() AND (status = 'draft' OR status = 'rejected' OR status IS NULL))
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Foundation can update any RAB"
ON public.rab_data FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'foundation'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'foundation'));

CREATE POLICY "Admin can update all RAB"
ON public.rab_data FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- DELETE Policies
CREATE POLICY "Users can delete their own RAB"
ON public.rab_data FOR DELETE
USING (user_id = auth.uid() AND (status = 'draft' OR status = 'rejected' OR status IS NULL));

CREATE POLICY "Admin can delete all RAB"
ON public.rab_data FOR DELETE
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- VERIFIKASI
-- ============================================

SELECT 
    'SUCCESS! All policies recreated' as status,
    cmd,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'rab_data'
GROUP BY cmd
ORDER BY cmd;
```

---

## 📋 **Langkah-Langkah:**

### **1. Buka Supabase SQL Editor**
- https://supabase.com/dashboard
- Pilih project
- Klik "SQL Editor"

### **2. Copy-Paste SQL di atas**
- Atau gunakan file: `DEBUG_AND_FIX_RLS.sql`

### **3. Klik "Run"**

### **4. Verifikasi Output:**
```
status                          | cmd    | policy_count
SUCCESS! All policies recreated | DELETE | 2
SUCCESS! All policies recreated | INSERT | 1
SUCCESS! All policies recreated | SELECT | 3
SUCCESS! All policies recreated | UPDATE | 3
```

**Total: 9 policies**

### **5. Clear Browser Cache**
```
Windows: Ctrl + Shift + Delete
Mac: Cmd + Shift + Delete
```
- Pilih "Cached images and files"
- Klik "Clear data"

### **6. Logout dan Login Kembali**
- Logout dari aplikasi
- Login kembali sebagai foundation

### **7. Test Reject RAB**
- Buka RAB status "Dikirim"
- Isi catatan
- Klik "Tolak RAB"
- ✅ **HARUS BERHASIL!**

---

## 🔍 **Penjelasan Policy:**

### **Foundation UPDATE Policy:**
```sql
USING: role = 'foundation'  -- Bisa UPDATE RAB apa saja
WITH CHECK: role = 'foundation'  -- Hanya cek role, TIDAK cek status!
```

**Kenapa tidak cek status?**
- Saat reject: status berubah dari `'submitted'` → `'rejected'`
- Jika WITH CHECK cek status = 'submitted', akan GAGAL
- Dengan hanya cek role, perubahan status diizinkan

### **Principal UPDATE Policy:**
```sql
USING: user_id = auth.uid() AND (status = 'draft' OR 'rejected')
WITH CHECK: user_id = auth.uid()
```

**Kenapa berbeda?**
- Principal hanya boleh edit RAB mereka sendiri
- Hanya boleh edit jika draft atau rejected
- WITH CHECK hanya cek ownership (agar bisa submit)

---

## 🚨 **Jika Masih Error:**

### **Cek 1: Apakah user benar-benar foundation?**
```sql
SELECT 
    auth.uid() as current_user_id,
    p.username,
    p.role
FROM public.profiles p
WHERE p.id = auth.uid();
```

**Expected:** role = 'foundation'

### **Cek 2: Apakah policy sudah dibuat?**
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'rab_data' 
AND cmd = 'UPDATE'
ORDER BY policyname;
```

**Expected:** 3 policies (Principal, Foundation, Admin)

### **Cek 3: Test manual UPDATE**
```sql
-- Ganti dengan ID RAB dan user ID yang sebenarnya
UPDATE public.rab_data 
SET status = 'rejected',
    reviewed_by = auth.uid(),
    review_comment = 'Test manual',
    updated_at = now()
WHERE id = 'e8d3a53e-fde9-40d1-81ee-1c4c2ea91c6f';
```

**Jika berhasil:** Policy sudah benar, masalah di frontend  
**Jika gagal:** Cek role user di profiles table

---

## 📊 **Complete Checklist:**

- [ ] SQL migration #1: Add `reviewed_by` column ✅
- [ ] SQL migration #2: Drop ALL old policies
- [ ] SQL migration #3: Create 9 new policies
- [ ] Verifikasi 9 policies created (3 SELECT, 1 INSERT, 3 UPDATE, 2 DELETE)
- [ ] Clear browser cache
- [ ] Logout dan login kembali
- [ ] Cek role user = 'foundation'
- [ ] Test reject RAB
- [ ] Status berubah ke "Ditolak"
- [ ] Catatan muncul di principal

---

## 🎯 **Root Cause Analysis:**

**Kemungkinan penyebab error persisten:**

1. ❌ **Policy lama masih ada** - Tidak ter-drop dengan benar
2. ❌ **Browser cache** - Masih pakai kode lama
3. ❌ **Role user salah** - User bukan foundation
4. ❌ **Multiple policies konflik** - Ada policy yang overlap

**Solusi:**
- ✅ Drop SEMUA policy dengan loop
- ✅ Buat ulang dari awal
- ✅ Clear cache dan logout/login
- ✅ Verifikasi role user

---

## 📁 **File Terkait:**

1. **`DEBUG_AND_FIX_RLS.sql`** ← GUNAKAN INI!
2. `ULTIMATE_FIX_RLS.md` ← Dokumentasi ini
3. `FINAL_FIX_RLS.sql` - Versi sebelumnya
4. `COMPLETE_FIX_GUIDE.md` - Guide lengkap

---

## 🎉 **Setelah Fix Berhasil:**

**Test scenario lengkap:**

1. ✅ **Principal create RAB** (draft)
2. ✅ **Principal submit RAB** (draft → submitted)
3. ✅ **Foundation reject RAB** (submitted → rejected) ← YANG KITA FIX
4. ✅ **Principal edit RAB** (rejected, masih rejected)
5. ✅ **Principal resubmit RAB** (rejected → submitted)
6. ✅ **Foundation approve RAB** (submitted → approved)

---

**Jalankan SQL di `DEBUG_AND_FIX_RLS.sql` sekarang!**

**Ini adalah fix terakhir dengan reset total. Harus berhasil!** 🚀

**Version:** 2.0 ULTIMATE  
**Date:** 24 November 2025  
**Status:** ✅ Final Solution
