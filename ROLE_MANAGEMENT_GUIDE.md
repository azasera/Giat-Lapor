# 📋 Panduan Manajemen Role Pengguna

## 🎯 Sistem Role

Aplikasi ini memiliki **3 jenis role**:

### 1. **Principal** (Kepala Sekolah) - Default
- ✅ Membuat dan mengedit laporan
- ✅ Membuat dan mengelola RAB
- ✅ Membuat dan mengelola Realisasi RAB
- ✅ Melihat dashboard dan statistik
- ❌ Tidak bisa melihat laporan sekolah lain
- ❌ Tidak bisa approve RAB

### 2. **Foundation** (Yayasan)
- ✅ Melihat semua laporan yang sudah disubmit
- ✅ Memberikan penilaian dan komentar pada laporan
- ✅ Melihat dan approve/reject RAB
- ✅ Melihat realisasi RAB
- ❌ Tidak bisa membuat laporan baru
- ❌ Tidak bisa mengelola user

### 3. **Admin** (Administrator)
- ✅ **Full Access** ke semua fitur
- ✅ Membuat dan mengedit laporan
- ✅ Mengelola RAB dan Realisasi
- ✅ Memberikan penilaian
- ✅ Mengelola daftar user (UsersPage)
- ✅ Melihat semua data

---

## 🔧 Cara Menentukan/Mengubah Role

### **Metode 1: Saat Registrasi User Baru (Otomatis)**

Ketika user baru mendaftar, sistem otomatis membuat profile dengan role **'principal'** (default).

**Kode di `supabaseService.ts`:**
```typescript
export const createProfileForNewUser = async (
  userId: string, 
  email: string, 
  role: 'principal' | 'foundation' | 'admin' = 'principal'
) => {
  // Default role = 'principal'
}
```

---

### **Metode 2: Via Supabase Dashboard (Manual)**

#### **Langkah-langkah:**

1. **Buka Supabase Dashboard**
   - Login ke https://supabase.com/dashboard
   - Pilih project Anda

2. **Buka Table Editor**
   - Klik **"Table Editor"** di sidebar
   - Pilih tabel **"profiles"**

3. **Edit Role User**
   - Cari user yang ingin diubah rolenya
   - Klik pada cell **"role"**
   - Ubah nilai menjadi salah satu:
     - `principal` (Kepala Sekolah)
     - `foundation` (Yayasan)
     - `admin` (Administrator)
   - Klik **Save** atau tekan Enter

4. **User Logout & Login Lagi**
   - User harus logout dan login kembali
   - Role baru akan aktif setelah login ulang

---

### **Metode 3: Via SQL Query (Batch/Multiple Users)**

Jika ingin mengubah role banyak user sekaligus:

#### **A. Lihat Semua User dan Role Mereka:**
```sql
SELECT 
  id,
  username,
  full_name,
  role,
  updated_at
FROM public.profiles
ORDER BY updated_at DESC;
```

#### **B. Ubah Role User Tertentu (by Email):**
```sql
-- Ubah role berdasarkan email
UPDATE public.profiles
SET role = 'foundation'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

#### **C. Ubah Role User Tertentu (by Username):**
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE username = 'nama_user';
```

#### **D. Ubah Role Multiple Users:**
```sql
-- Ubah beberapa user sekaligus menjadi foundation
UPDATE public.profiles
SET role = 'foundation'
WHERE username IN ('user1', 'user2', 'user3');
```

#### **E. Set User Pertama sebagai Admin:**
```sql
-- Jadikan user pertama yang register sebagai admin
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM public.profiles ORDER BY updated_at ASC LIMIT 1
);
```

---

### **Metode 4: Membuat Admin Page (Fitur Aplikasi)**

Aplikasi sudah memiliki **UsersPage** untuk admin mengelola user.

**Lokasi:** `src/pages/UsersPage.tsx`

**Cara Akses:**
1. Login sebagai user dengan role **'admin'**
2. Klik menu **"Daftar Akun"** (hanya muncul untuk admin)
3. Di halaman ini admin bisa:
   - Melihat semua user
   - Mengubah role user
   - Mengelola user lainnya

**Catatan:** Anda perlu set minimal 1 user sebagai admin dulu via Supabase Dashboard atau SQL.

---

## 🔐 Security & RLS (Row Level Security)

### **Policies yang Aktif:**

```sql
-- Semua orang bisa melihat profiles
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using (true);

-- User hanya bisa insert profile mereka sendiri
create policy "Users can insert their own profile."
  on public.profiles for insert
  with check (auth.uid() = id);

-- User hanya bisa update profile mereka sendiri
create policy "Users can update own profile."
  on public.profiles for update
  using (auth.uid() = id);
```

### **⚠️ Penting:**
- User **tidak bisa mengubah role mereka sendiri** via aplikasi
- Hanya **admin** atau **database admin** yang bisa mengubah role
- Ini mencegah privilege escalation

---

## 🚀 Quick Start: Setup Admin Pertama

### **Langkah Cepat:**

1. **Register user pertama** via aplikasi
2. **Buka Supabase SQL Editor**
3. **Jalankan query ini:**

```sql
-- Jadikan user pertama sebagai admin
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM public.profiles 
  ORDER BY updated_at ASC 
  LIMIT 1
);
```

4. **Logout dan Login lagi**
5. **Sekarang Anda admin!** Menu "Daftar Akun" akan muncul

---

## 📊 Monitoring Role

### **Cek Distribusi Role:**
```sql
SELECT 
  role,
  COUNT(*) as jumlah_user
FROM public.profiles
GROUP BY role
ORDER BY jumlah_user DESC;
```

### **Cek User Tanpa Role:**
```sql
SELECT * FROM public.profiles
WHERE role IS NULL OR role = '';
```

### **Cek Admin:**
```sql
SELECT 
  username,
  full_name,
  role,
  updated_at
FROM public.profiles
WHERE role = 'admin';
```

---

## 🔄 Alur Role di Aplikasi

```
┌─────────────────────────────────────────────────────┐
│  User Register → Profile Created (role: 'principal') │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  Admin Changes Role via Supabase/UsersPage          │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  User Logout & Login → New Role Active              │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  UI Adapts Based on Role (Menu, Permissions, etc)   │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Troubleshooting

### **Problem: User tidak bisa akses fitur tertentu**
**Solusi:**
1. Cek role user di Supabase
2. Pastikan user sudah logout & login lagi
3. Clear browser cache/cookies

### **Problem: Role tidak berubah setelah di-update**
**Solusi:**
1. User **HARUS** logout dan login lagi
2. Role di-cache di session, tidak auto-refresh

### **Problem: Tidak ada admin**
**Solusi:**
1. Gunakan SQL query untuk set admin pertama
2. Atau edit langsung di Supabase Table Editor

### **Problem: Semua user jadi principal**
**Solusi:**
- Ini normal, default role adalah 'principal'
- Ubah role secara manual untuk user yang perlu role lain

---

## 📝 Best Practices

1. ✅ **Minimal 1 Admin**: Selalu ada minimal 1 user dengan role admin
2. ✅ **Dokumentasi**: Catat siapa saja yang punya role admin/foundation
3. ✅ **Backup**: Backup data profiles sebelum bulk update
4. ✅ **Testing**: Test perubahan role di development dulu
5. ✅ **Security**: Jangan share credentials admin

---

## 🎓 Contoh Skenario

### **Skenario 1: Setup Awal Pesantren**
```sql
-- User 1: Admin (Kepala IT)
UPDATE public.profiles SET role = 'admin' 
WHERE username = 'admin_it';

-- User 2-5: Principal (Kepala Sekolah)
-- Sudah otomatis role 'principal' saat register

-- User 6: Foundation (Pihak Yayasan)
UPDATE public.profiles SET role = 'foundation' 
WHERE username = 'yayasan_user';
```

### **Skenario 2: Rotasi Kepala Sekolah**
```sql
-- Kepala sekolah lama jadi foundation (pengawas)
UPDATE public.profiles SET role = 'foundation' 
WHERE username = 'kepala_lama';

-- Kepala sekolah baru tetap principal
-- (sudah otomatis saat register)
```

---

## 📞 Support

Jika ada pertanyaan atau masalah dengan role management, hubungi admin sistem atau developer.
