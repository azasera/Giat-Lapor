# Cara Memperbaiki Tabel Reports (SAFE VERSION)

## Error yang Terjadi:
```
Error: null value in column "id" of relation "reports" violates not-null constraint
Error: column "id" is in a primary key
```

## Penyebab:
Kolom `id` adalah primary key tapi tidak memiliki default value untuk auto-generate UUID.

## Solusi AMAN:

### 1. Buka Supabase Dashboard
- Login ke https://supabase.com
- Pilih project Anda
- Klik **"SQL Editor"**

### 2. Jalankan Script Perbaikan AMAN
Copy dan paste script ini ke SQL Editor:

```sql
-- Check current schema first
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'reports' AND column_name = 'id';

-- Simply set the default value for ID column (safe for primary key)
ALTER TABLE reports 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verify the fix
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'reports' AND column_name = 'id';
```

### 3. Klik "Run"
Jalankan script dan pastikan tidak ada error.

### 4. Verifikasi Hasil
Setelah script berhasil, Anda akan melihat output seperti ini:

**Before Fix:**
```
column_name | data_type | column_default | is_nullable
id          | uuid      | NULL           | NO
```

**After Fix:**
```
column_name | data_type | column_default      | is_nullable
id          | uuid      | gen_random_uuid()   | NO
```

### 5. Test Insert (Optional)
Untuk memastikan fix berhasil, jalankan test insert ini:

```sql
-- Test insert without id field
INSERT INTO reports (user_id, report_date, principal_name, school_name, period, status) 
VALUES ('test-user-id', '2025-01-01', 'Test Principal', 'Test School', 'January', 'draft');

-- Check if ID was auto-generated
SELECT id, principal_name FROM reports WHERE principal_name = 'Test Principal';

-- Clean up test data
DELETE FROM reports WHERE principal_name = 'Test Principal';
```

### 6. Refresh Aplikasi
- Kembali ke aplikasi web
- Refresh halaman (F5)
- Coba kirim laporan lagi

## Mengapa Script Sebelumnya Error:

❌ **Script Lama (ERROR):**
```sql
ALTER TABLE reports ALTER COLUMN id DROP NOT NULL; -- ERROR: Primary key tidak bisa NULL
```

✅ **Script Baru (AMAN):**
```sql
ALTER TABLE reports ALTER COLUMN id SET DEFAULT gen_random_uuid(); -- AMAN: Hanya set default
```

## Troubleshooting:

### Jika masih error setelah fix:
1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+F5)
3. **Check console** untuk error lain

### Jika script SQL gagal:
- Pastikan Anda memiliki permission ALTER TABLE
- Jalankan query satu per satu untuk isolasi masalah

## Setelah Fix Berhasil:
✅ Insert report tanpa field `id` akan berhasil  
✅ UUID auto-generated untuk setiap record baru  
✅ Error NOT NULL constraint tidak akan muncul lagi  
✅ Pengiriman laporan ke yayasan berfungsi normal  
✅ Primary key constraint tetap aman  

File SQL aman tersedia di: `FIX_REPORTS_ID_SAFE.sql`