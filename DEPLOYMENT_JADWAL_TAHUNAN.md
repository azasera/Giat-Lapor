# 🚀 Deployment: Fitur Jadwal Tahunan Supervisi

## Ringkasan Perubahan

Menambahkan fitur **Jadwal Tahunan Supervisi** yang memungkinkan pembuatan jadwal dalam format tabel bulanan (seperti referensi gambar).

### File Baru:
1. `src/pages/TahfidzAnnualSchedulePage.tsx` - Halaman jadwal tahunan
2. `supabase_schema_tahfidz_annual_schedule.sql` - Schema database
3. `JADWAL_SUPERVISI_GUIDE.md` - Dokumentasi penggunaan

### File Dimodifikasi:
1. `src/App.tsx` - Menambah routing
2. `src/pages/TahfidzSupervisionSchedulePage.tsx` - Menambah link navigasi
3. `src/components/IslamicPrincipalReportApp.tsx` - Menambah submenu

---

## 📋 Langkah Deployment

### 1. Database Setup (Supabase)

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Buka file: supabase_schema_tahfidz_annual_schedule.sql
-- Copy semua isi file dan jalankan di Supabase
```

**Atau manual:**

```sql
-- Tabel untuk jadwal tahunan
CREATE TABLE IF NOT EXISTS public.tahfidz_annual_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text NOT NULL,
  institution_name text NOT NULL,
  schedule_data jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.tahfidz_annual_schedules ENABLE ROW LEVEL SECURITY;

-- Policies (lihat file SQL lengkap untuk semua policies)
```

**Verifikasi:**
```sql
-- Cek tabel sudah dibuat
SELECT * FROM information_schema.tables 
WHERE table_name = 'tahfidz_annual_schedules';

-- Cek policies
SELECT * FROM pg_policies 
WHERE tablename = 'tahfidz_annual_schedules';
```

---

### 2. Frontend Deployment

#### A. Install Dependencies (jika perlu)
```bash
cd Giat-main
npm install
```

#### B. Build
```bash
npm run build
```

#### C. Test Lokal
```bash
npm run dev
```

**Test checklist:**
- [ ] Buka `/tahfidz-annual-schedule`
- [ ] Coba auto distribusi
- [ ] Coba tambah guru manual
- [ ] Coba simpan jadwal
- [ ] Coba load jadwal tersimpan
- [ ] Coba print (Ctrl+P)
- [ ] Coba navigasi ke jadwal per tanggal
- [ ] Coba akses dari menu sidebar

---

### 3. Deploy ke Production

#### Vercel (Rekomendasi)
```bash
# Push ke Git
git add .
git commit -m "feat: add annual schedule feature"
git push origin main

# Vercel akan auto-deploy
```

#### Manual Deploy
```bash
# Build production
npm run build

# Upload folder dist/ ke hosting
```

---

## 🧪 Testing

### Test Case 1: Buat Jadwal Tahunan
```
1. Login sebagai principal/admin
2. Buka menu Supervisi Tahfidz → Jadwal Tahunan
3. Isi nama lembaga: "Test School"
4. Pilih tahun: 2025
5. Klik "Auto Distribusi"
6. Verifikasi: Semua guru terdistribusi ke 12 bulan
7. Klik "Simpan"
8. Verifikasi: Jadwal muncul di "Jadwal Tersimpan"
```

**Expected Result:** ✅ Jadwal tersimpan dan bisa di-load kembali

### Test Case 2: Edit Jadwal Manual
```
1. Buka jadwal tahunan
2. Klik dropdown di cell Januari
3. Pilih guru "Ahmad"
4. Verifikasi: Guru muncul di cell
5. Hover ke nama guru
6. Klik icon sampah
7. Verifikasi: Guru terhapus dari cell
```

**Expected Result:** ✅ Bisa tambah dan hapus guru manual

### Test Case 3: Print Jadwal
```
1. Buka jadwal tahunan yang sudah ada data
2. Tekan Ctrl+P (Windows) atau Cmd+P (Mac)
3. Verifikasi: Preview print menampilkan tabel dengan baik
4. Cek: Tidak ada elemen UI yang tidak perlu (button, sidebar, dll)
```

**Expected Result:** ✅ Print preview bersih dan rapi

### Test Case 4: Navigasi
```
1. Dari dashboard, klik menu "Supervisi Tahfidz"
2. Verifikasi: Muncul submenu
3. Klik "Jadwal Tahunan"
4. Verifikasi: Masuk ke halaman jadwal tahunan
5. Klik tombol "Jadwal Per Tanggal"
6. Verifikasi: Pindah ke halaman jadwal per tanggal
```

**Expected Result:** ✅ Navigasi lancar antar halaman

### Test Case 5: Permission
```
1. Login sebagai foundation
2. Coba akses /tahfidz-annual-schedule
3. Verifikasi: Tidak bisa akses (redirect atau error)
```

**Expected Result:** ✅ Hanya principal dan admin yang bisa akses

---

## 🔒 Security Checklist

- [x] RLS enabled untuk tabel `tahfidz_annual_schedules`
- [x] Policy: User hanya bisa lihat jadwal sendiri
- [x] Policy: Foundation bisa lihat semua jadwal
- [x] Policy: Admin bisa CRUD semua jadwal
- [x] Policy: Principal bisa CRUD jadwal sendiri
- [x] Foreign key ke `auth.users` dengan ON DELETE CASCADE
- [x] Validasi role di frontend (principal/admin only)

---

## 📊 Database Schema

### Tabel: tahfidz_annual_schedules

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| year | text | Tahun jadwal (contoh: "2025") |
| institution_name | text | Nama lembaga |
| schedule_data | jsonb | Data jadwal (array of {month, teachers}) |
| created_by | uuid | User ID pembuat |
| created_at | timestamp | Waktu dibuat |
| updated_at | timestamp | Waktu diupdate |

### Format schedule_data (JSONB):
```json
[
  {
    "month": "Januari",
    "teachers": ["Guru A", "Guru B"]
  },
  {
    "month": "Februari",
    "teachers": ["Guru C"]
  },
  ...
]
```

---

## 🐛 Known Issues & Limitations

### Issue 1: Print di Mobile
**Problem:** Print preview kurang optimal di mobile browser  
**Workaround:** Gunakan desktop browser untuk print  
**Status:** Low priority

### Issue 2: Nama Guru Panjang
**Problem:** Nama guru yang sangat panjang bisa overflow di cell  
**Workaround:** Gunakan nama singkat atau inisial  
**Status:** Will fix in v2

### Limitation 1: Tidak Ada Link ke Supervisi
**Description:** Jadwal tahunan hanya referensi, tidak ter-link ke hasil supervisi  
**Reason:** By design - jadwal tahunan untuk perencanaan, bukan tracking  
**Alternative:** Gunakan jadwal per tanggal untuk tracking detail

---

## 📈 Future Enhancements

### v1.1 (Next Sprint)
- [ ] Export jadwal tahunan ke PDF
- [ ] Export jadwal tahunan ke Excel
- [ ] Template jadwal (bisa save dan reuse)
- [ ] Duplicate jadwal tahun sebelumnya

### v1.2 (Future)
- [ ] Drag & drop guru antar bulan
- [ ] Color coding per guru
- [ ] Integrasi dengan kalender akademik
- [ ] Notifikasi saat mendekati bulan supervisi

### v2.0 (Long Term)
- [ ] Sync jadwal tahunan dengan jadwal per tanggal
- [ ] Auto-generate jadwal per tanggal dari jadwal tahunan
- [ ] Dashboard analytics untuk jadwal
- [ ] Mobile app untuk jadwal

---

## 🆘 Rollback Plan

Jika terjadi masalah serius:

### 1. Rollback Database
```sql
-- Hapus tabel
DROP TABLE IF EXISTS public.tahfidz_annual_schedules CASCADE;
```

### 2. Rollback Frontend
```bash
# Revert commit
git revert HEAD

# Push
git push origin main
```

### 3. Disable Feature
```typescript
// Di App.tsx, comment routing:
/*
<Route
  path="/tahfidz-annual-schedule"
  element={...}
/>
*/

// Di IslamicPrincipalReportApp.tsx, comment submenu
```

---

## 📞 Support

**Developer Contact:**
- Email: dev@giat-lapor.com
- WhatsApp: [Nomor Developer]

**Documentation:**
- User Guide: `JADWAL_SUPERVISI_GUIDE.md`
- Supervisor Guide: `PANDUAN_SUPERVISOR_TAHFIDZ.md`
- Technical Spec: `SUPERVISI_GURU_TAHFIDZ_FINAL.md`

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Code review selesai
- [ ] Testing lokal passed
- [ ] Database schema reviewed
- [ ] Security policies verified
- [ ] Documentation complete

### Deployment
- [ ] Database migration executed
- [ ] Frontend deployed
- [ ] Smoke test di production
- [ ] Monitoring setup

### Post-Deployment
- [ ] User notification sent
- [ ] Training session scheduled (if needed)
- [ ] Monitor error logs (24 jam pertama)
- [ ] Collect user feedback

---

**Status:** ✅ Ready for Deployment  
**Version:** 1.0.0  
**Date:** 24 November 2025  
**Deployed By:** [Your Name]
