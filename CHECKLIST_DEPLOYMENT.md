# ✅ Checklist Deployment: Jadwal Tahunan Supervisi

## 📋 Pre-Deployment Checklist

### 1. Database Setup
- [ ] Buka Supabase Dashboard
- [ ] Pilih project yang benar
- [ ] Buka SQL Editor
- [ ] Copy isi file `supabase_schema_tahfidz_annual_schedule.sql`
- [ ] Paste dan Run SQL
- [ ] Verifikasi tabel sudah dibuat:
  ```sql
  SELECT * FROM information_schema.tables 
  WHERE table_name = 'tahfidz_annual_schedules';
  ```
- [ ] Verifikasi policies sudah aktif:
  ```sql
  SELECT * FROM pg_policies 
  WHERE tablename = 'tahfidz_annual_schedules';
  ```

### 2. Code Review
- [ ] File `TahfidzAnnualSchedulePage.tsx` sudah ada
- [ ] Routing di `App.tsx` sudah ditambahkan
- [ ] Submenu di `IslamicPrincipalReportApp.tsx` sudah ditambahkan
- [ ] Link navigasi di `TahfidzSupervisionSchedulePage.tsx` sudah ditambahkan
- [ ] Tidak ada error TypeScript (run `npm run build`)

### 3. Testing Lokal
- [ ] Run `npm run dev`
- [ ] Login sebagai principal/admin
- [ ] Buka `/tahfidz-annual-schedule`
- [ ] Test auto distribusi
- [ ] Test tambah guru manual
- [ ] Test hapus guru
- [ ] Test simpan jadwal
- [ ] Test load jadwal tersimpan
- [ ] Test edit jadwal
- [ ] Test hapus jadwal
- [ ] Test print (Ctrl+P)
- [ ] Test navigasi ke jadwal per tanggal
- [ ] Test akses dari menu sidebar

### 4. Dokumentasi
- [ ] `QUICK_START_JADWAL.md` sudah dibuat
- [ ] `SUMMARY_JADWAL_SUPERVISI.md` sudah dibuat
- [ ] `JADWAL_SUPERVISI_GUIDE.md` sudah dibuat
- [ ] `DEPLOYMENT_JADWAL_TAHUNAN.md` sudah dibuat
- [ ] `README_JADWAL_SUPERVISI.md` sudah dibuat
- [ ] `sample_data_jadwal_tahunan.sql` sudah dibuat

---

## 🚀 Deployment Steps

### Step 1: Commit & Push
```bash
# Di folder Giat-main
git add .
git commit -m "feat: add annual schedule feature for tahfidz supervision"
git push origin main
```
- [ ] Git commit berhasil
- [ ] Git push berhasil

### Step 2: Vercel Deployment (Auto)
- [ ] Vercel mendeteksi push baru
- [ ] Build dimulai otomatis
- [ ] Build berhasil tanpa error
- [ ] Deployment selesai
- [ ] Dapatkan URL production

### Step 3: Smoke Test Production
- [ ] Buka URL production
- [ ] Login sebagai principal/admin
- [ ] Buka menu Supervisi Tahfidz
- [ ] Verifikasi submenu muncul
- [ ] Klik "Jadwal Tahunan"
- [ ] Verifikasi halaman load dengan baik
- [ ] Test auto distribusi
- [ ] Test simpan jadwal
- [ ] Test load jadwal
- [ ] Test print

---

## 🧪 Testing Checklist

### Functional Testing

#### Test Case 1: Auto Distribusi
- [ ] Klik "Auto Distribusi"
- [ ] Verifikasi: Semua guru terdistribusi ke 12 bulan
- [ ] Verifikasi: Setiap guru muncul 4x (setiap 3 bulan)
- [ ] Verifikasi: Tidak ada error

#### Test Case 2: Manual Add/Remove
- [ ] Klik dropdown di cell bulan
- [ ] Pilih guru
- [ ] Verifikasi: Guru muncul di cell
- [ ] Hover ke nama guru
- [ ] Klik icon sampah
- [ ] Verifikasi: Guru terhapus

#### Test Case 3: Save & Load
- [ ] Isi nama lembaga
- [ ] Pilih tahun
- [ ] Tambah beberapa guru
- [ ] Klik "Simpan"
- [ ] Verifikasi: Muncul di "Jadwal Tersimpan"
- [ ] Refresh halaman
- [ ] Verifikasi: Jadwal masih ada
- [ ] Klik icon pensil
- [ ] Verifikasi: Jadwal ter-load ke form

#### Test Case 4: Edit & Update
- [ ] Load jadwal tersimpan
- [ ] Edit beberapa cell
- [ ] Klik "Update"
- [ ] Verifikasi: Perubahan tersimpan
- [ ] Reload jadwal
- [ ] Verifikasi: Perubahan masih ada

#### Test Case 5: Delete
- [ ] Klik icon sampah di jadwal tersimpan
- [ ] Konfirmasi delete
- [ ] Verifikasi: Jadwal terhapus
- [ ] Refresh halaman
- [ ] Verifikasi: Jadwal tidak muncul lagi

#### Test Case 6: Print
- [ ] Buka jadwal dengan data
- [ ] Tekan Ctrl+P (Windows) atau Cmd+P (Mac)
- [ ] Verifikasi: Preview print rapi
- [ ] Verifikasi: Tidak ada button/UI yang tidak perlu
- [ ] Verifikasi: Tabel tercetak dengan baik

#### Test Case 7: Navigation
- [ ] Dari dashboard, klik "Supervisi Tahfidz"
- [ ] Verifikasi: Submenu muncul
- [ ] Klik "Jadwal Tahunan"
- [ ] Verifikasi: Masuk ke halaman jadwal tahunan
- [ ] Klik tombol "Jadwal Per Tanggal"
- [ ] Verifikasi: Pindah ke jadwal per tanggal
- [ ] Klik tombol "Jadwal Tahunan"
- [ ] Verifikasi: Kembali ke jadwal tahunan

### Permission Testing

#### Test Case 8: Principal Access
- [ ] Login sebagai principal
- [ ] Verifikasi: Bisa akses jadwal tahunan
- [ ] Verifikasi: Bisa create jadwal
- [ ] Verifikasi: Bisa edit jadwal sendiri
- [ ] Verifikasi: Bisa delete jadwal sendiri

#### Test Case 9: Admin Access
- [ ] Login sebagai admin
- [ ] Verifikasi: Bisa akses jadwal tahunan
- [ ] Verifikasi: Bisa lihat semua jadwal
- [ ] Verifikasi: Bisa edit semua jadwal
- [ ] Verifikasi: Bisa delete semua jadwal

#### Test Case 10: Foundation Access
- [ ] Login sebagai foundation
- [ ] Verifikasi: Bisa lihat jadwal tahunan (read-only)
- [ ] Verifikasi: Tidak bisa create/edit/delete

### UI/UX Testing

#### Test Case 11: Responsive Design
- [ ] Test di desktop (1920x1080)
- [ ] Test di laptop (1366x768)
- [ ] Test di tablet (768x1024)
- [ ] Test di mobile (375x667)
- [ ] Verifikasi: Layout responsive di semua ukuran

#### Test Case 12: Dark Mode
- [ ] Toggle dark mode
- [ ] Verifikasi: Warna berubah dengan baik
- [ ] Verifikasi: Kontras tetap bagus
- [ ] Verifikasi: Tidak ada text yang tidak terbaca

#### Test Case 13: Loading States
- [ ] Verifikasi: Loading indicator muncul saat fetch data
- [ ] Verifikasi: Loading indicator muncul saat save
- [ ] Verifikasi: Button disabled saat loading

### Performance Testing

#### Test Case 14: Large Data
- [ ] Buat jadwal dengan 50+ guru
- [ ] Verifikasi: Halaman tetap responsive
- [ ] Verifikasi: Scroll smooth
- [ ] Verifikasi: Save tidak timeout

#### Test Case 15: Network
- [ ] Test dengan koneksi lambat (3G)
- [ ] Verifikasi: Loading indicator muncul
- [ ] Verifikasi: Data tetap tersimpan
- [ ] Test offline
- [ ] Verifikasi: Error message muncul

---

## 🔒 Security Checklist

### Database Security
- [ ] RLS enabled untuk `tahfidz_annual_schedules`
- [ ] Policy: User hanya bisa lihat jadwal sendiri
- [ ] Policy: Foundation bisa lihat semua (read-only)
- [ ] Policy: Admin bisa CRUD semua
- [ ] Policy: Principal bisa CRUD jadwal sendiri
- [ ] Foreign key constraint aktif
- [ ] ON DELETE CASCADE berfungsi

### Frontend Security
- [ ] Validasi role di frontend (principal/admin only)
- [ ] Tidak ada hardcoded credentials
- [ ] Tidak ada sensitive data di console.log
- [ ] API calls menggunakan auth token
- [ ] Error messages tidak expose sensitive info

---

## 📊 Monitoring Checklist

### Post-Deployment (24 Jam Pertama)
- [ ] Monitor error logs di Vercel
- [ ] Monitor error logs di Supabase
- [ ] Check performance metrics
- [ ] Check user feedback
- [ ] Monitor database queries

### Week 1
- [ ] Collect user feedback
- [ ] Identify bugs/issues
- [ ] Plan fixes/improvements
- [ ] Update documentation if needed

---

## 📞 Rollback Plan

### If Critical Issue Found:

#### Option 1: Quick Fix
```bash
# Fix code
git add .
git commit -m "fix: critical issue in annual schedule"
git push
# Vercel auto-deploy
```

#### Option 2: Rollback Deployment
- [ ] Go to Vercel Dashboard
- [ ] Select previous deployment
- [ ] Click "Promote to Production"

#### Option 3: Disable Feature
```typescript
// In App.tsx, comment out route:
/*
<Route
  path="/tahfidz-annual-schedule"
  element={...}
/>
*/

// In IslamicPrincipalReportApp.tsx, comment out submenu
```

#### Option 4: Rollback Database
```sql
-- Drop table (LAST RESORT!)
DROP TABLE IF EXISTS public.tahfidz_annual_schedules CASCADE;
```

---

## 📝 Post-Deployment Tasks

### Communication
- [ ] Notify users about new feature
- [ ] Send email announcement
- [ ] Post in WhatsApp group
- [ ] Update user manual

### Training (Optional)
- [ ] Schedule training session
- [ ] Prepare demo
- [ ] Record video tutorial
- [ ] Answer user questions

### Documentation
- [ ] Update changelog
- [ ] Update version number
- [ ] Archive old documentation
- [ ] Update README

---

## ✅ Final Checklist

### Before Going Live
- [ ] All tests passed
- [ ] Documentation complete
- [ ] Backup database
- [ ] Rollback plan ready
- [ ] Team notified
- [ ] Support ready

### Go Live!
- [ ] Deploy to production
- [ ] Smoke test passed
- [ ] Monitor for 1 hour
- [ ] All systems green

### Post Go-Live
- [ ] Send announcement
- [ ] Monitor feedback
- [ ] Fix urgent issues
- [ ] Plan next iteration

---

## 🎉 Success Criteria

Feature is considered successfully deployed when:
- ✅ All tests passed
- ✅ No critical bugs in 24 hours
- ✅ Users can create and use annual schedules
- ✅ Performance is acceptable
- ✅ No security issues found
- ✅ Positive user feedback

---

## 📞 Emergency Contacts

**Developer:** [Your Name]  
**Email:** dev@giat-lapor.com  
**WhatsApp:** [Your Number]  
**Backup:** [Backup Contact]

---

**Prepared by:** Kiro AI Assistant  
**Date:** 24 November 2025  
**Version:** 1.0.0  
**Status:** Ready for Deployment ✅
