# 🔴 MASALAH RLS JADWAL TAHUNAN - BELUM TERSELESAIKAN

## ❌ **Error:**
```
POST /rest/v1/tahfidz_annual_schedules 403 (Forbidden)
Error: new row violates row-level security policy for table "tahfidz_annual_schedules"
```

## 🔍 **Yang Sudah Dicoba:**

### 1. Disable RLS Sepenuhnya
- ✅ `ALTER TABLE DISABLE ROW LEVEL SECURITY` - Berhasil
- ✅ Hapus semua policies - Berhasil (0 policies)
- ✅ Manual INSERT di SQL Editor - **BERHASIL**
- ❌ INSERT via REST API - **GAGAL 403**

### 2. Enable RLS dengan Policy Permisif
- ✅ Policy `USING (true)` dan `WITH CHECK (true)` - Dibuat
- ❌ INSERT via REST API - **GAGAL 403**

### 3. Grant Permissions Eksplisit
- ✅ `GRANT ALL TO anon, authenticated, service_role` - Berhasil
- ❌ INSERT via REST API - **GAGAL 403**

### 4. Restart Supabase Project
- ✅ Restart project - Berhasil
- ✅ Tunggu 2-3 menit - Berhasil
- ❌ INSERT via REST API - **GAGAL 403**

### 5. Recreate Table dari Awal
- ✅ DROP dan CREATE table baru - Berhasil
- ✅ Tanpa RLS dari awal - Berhasil
- ❌ INSERT via REST API - **GAGAL 403**

### 6. RPC Function dengan SECURITY DEFINER
- ✅ Create function - Berhasil
- ❌ Function tidak muncul di schema cache - **GAGAL 404**

### 7. Tabel Baru dengan Nama Berbeda
- ✅ Create table `annual_schedules` - Berhasil
- ❌ Table tidak muncul di schema cache - **GAGAL 404**

## 🎯 **Kesimpulan:**

Ada **BUG di Supabase PostgREST** yang membuat:
1. RLS tetap enforce meskipun sudah disabled
2. Schema cache tidak refresh meskipun sudah restart project
3. Manual SQL berhasil, tapi REST API gagal

## 💡 **Solusi Sementara:**

**TIDAK ADA** - Fitur jadwal tahunan tidak bisa digunakan sampai issue ini resolved.

## 📋 **Next Steps:**

1. **Contact Supabase Support** dengan detail issue ini
2. **Cek Supabase Dashboard** → API Settings → apakah ada restrictions
3. **Coba di Supabase project baru** untuk test apakah issue di project ini saja
4. **Gunakan Supabase Functions** sebagai workaround (Edge Functions)

## 📝 **Data untuk Support:**

- **Project URL:** https://eyubefxeblzvavriltao.supabase.co
- **Table:** `tahfidz_annual_schedules`
- **RLS Status:** Disabled (verified via SQL)
- **Policies:** 0 (verified via SQL)
- **Manual INSERT:** ✅ Berhasil
- **REST API INSERT:** ❌ Gagal 403
- **Error Code:** 42501 (RLS violation)

---

**Created:** 2025-11-24
**Status:** UNRESOLVED
