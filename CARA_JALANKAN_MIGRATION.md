# Cara Menjalankan Database Migration

## Error yang Terjadi:
```
Error saving memo: Could not find the 'show_from_to' column of 'memos' in the schema cache
Error saving memo: Could not find the 'document_title' column of 'memos' in the schema cache
```

## Penyebab:
Kolom `document_title` dan `show_from_to` belum ditambahkan ke tabel `memos` di database Supabase.

## Solusi:
Jalankan SQL migration untuk menambahkan kolom-kolom tersebut.

---

## Langkah-langkah:

### 1. Buka Supabase Dashboard
- Login ke https://supabase.com
- Pilih project Anda

### 2. Buka SQL Editor
- Di sidebar kiri, klik **"SQL Editor"**
- Atau klik menu **"Database"** → **"SQL Editor"**

### 3. Buat Query Baru
- Klik tombol **"New query"** atau **"+ New Query"**

### 4. Copy-Paste Script SQL
Buka file `MIGRATION_ADD_MEMO_COLUMNS.sql` dan copy semua isinya, lalu paste ke SQL Editor.

Atau copy script ini:

```sql
-- Migration: Add document_title and show_from_to columns to memos table

-- 1. Add document_title column
ALTER TABLE memos 
ADD COLUMN IF NOT EXISTS document_title TEXT DEFAULT 'MEMO INTERNAL';

UPDATE memos 
SET document_title = 'MEMO INTERNAL' 
WHERE document_title IS NULL;

COMMENT ON COLUMN memos.document_title IS 'Custom document title (e.g., MEMO INTERNAL, SURAT PERINGATAN, SURAT PERNYATAAN, SURAT PINDAH SEKOLAH)';

-- 2. Add show_from_to column
ALTER TABLE memos 
ADD COLUMN IF NOT EXISTS show_from_to BOOLEAN DEFAULT true;

UPDATE memos 
SET show_from_to = true 
WHERE show_from_to IS NULL;

COMMENT ON COLUMN memos.show_from_to IS 'Toggle to show/hide "Dari" and "Kepada" section in the document';

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'memos' 
AND column_name IN ('document_title', 'show_from_to');
```

### 5. Jalankan Script
- Klik tombol **"Run"** atau tekan **Ctrl+Enter** (Windows) / **Cmd+Enter** (Mac)

### 6. Verifikasi Hasil
Setelah script berhasil dijalankan, Anda akan melihat hasil query di bagian bawah yang menampilkan 2 kolom baru:

```
column_name      | data_type | column_default
-----------------|-----------|-----------------
document_title   | text      | 'MEMO INTERNAL'
show_from_to     | boolean   | true
```

### 7. Refresh Aplikasi
- Kembali ke aplikasi web
- Refresh halaman (F5 atau Ctrl+R)
- Coba simpan memo lagi

---

## Troubleshooting:

### Jika masih error setelah migration:
1. **Clear cache browser**:
   - Chrome: Ctrl+Shift+Delete → Clear cache
   - Firefox: Ctrl+Shift+Delete → Clear cache

2. **Hard refresh**:
   - Windows: Ctrl+F5
   - Mac: Cmd+Shift+R

3. **Restart Supabase connection**:
   - Di Supabase Dashboard, klik **"Settings"** → **"API"**
   - Copy ulang API URL dan anon key (jika perlu)

### Jika ada error saat menjalankan SQL:
- Pastikan Anda memiliki permission untuk ALTER TABLE
- Pastikan tabel `memos` sudah ada
- Cek apakah kolom sudah ada dengan query:
  ```sql
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'memos';
  ```

---

## Setelah Migration Berhasil:

Fitur-fitur baru yang akan berfungsi:
- ✅ Custom judul dokumen (MEMO INTERNAL, SURAT PERINGATAN, dll)
- ✅ Toggle show/hide section "Dari-Kepada"
- ✅ Duplikasi memo
- ✅ Format tanggal yang lebih rapi
- ✅ Tabel opsional (bisa tanpa tabel)

Semua fitur akan langsung berfungsi tanpa perlu deploy ulang!
