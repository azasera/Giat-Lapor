# ⚡ Quick Start: Jadwal Supervisi

## 🚀 Mulai dalam 5 Menit!

### Step 1: Deploy Database (2 menit)

1. Buka **Supabase Dashboard**
2. Pilih project Anda
3. Klik **SQL Editor**
4. Copy-paste isi file `supabase_schema_tahfidz_annual_schedule.sql`
5. Klik **Run**
6. ✅ Selesai!

### Step 2: Deploy Frontend (2 menit)

```bash
# Di folder Giat-main
npm run build

# Push ke Git (Vercel auto-deploy)
git add .
git commit -m "feat: add annual schedule"
git push
```

### Step 3: Test (1 menit)

1. Login sebagai **principal** atau **admin**
2. Klik menu **Supervisi Tahfidz** di sidebar
3. Pilih **Jadwal Tahunan**
4. Klik **Auto Distribusi**
5. Klik **Simpan**
6. ✅ Jadwal tahunan siap!

---

## 📋 Checklist Deployment

### Database
- [ ] Tabel `tahfidz_annual_schedules` sudah dibuat
- [ ] RLS policies sudah aktif
- [ ] Test insert data manual berhasil

### Frontend
- [ ] Build berhasil tanpa error
- [ ] Deploy ke production berhasil
- [ ] Halaman `/tahfidz-annual-schedule` bisa diakses

### Testing
- [ ] Auto distribusi berfungsi
- [ ] Simpan jadwal berhasil
- [ ] Load jadwal berhasil
- [ ] Print jadwal rapi
- [ ] Navigasi antar jadwal lancar

---

## 🎯 Cara Pakai (Super Cepat)

### Jadwal Tahunan (Format Tabel)

**Buat Jadwal Baru:**
```
1. Isi nama lembaga
2. Pilih tahun
3. Klik "Auto Distribusi"
4. Klik "Simpan"
✅ Selesai!
```

**Edit Jadwal:**
```
1. Klik dropdown di cell bulan
2. Pilih guru
3. Klik "Simpan"
✅ Selesai!
```

**Print Jadwal:**
```
1. Tekan Ctrl+P (Windows) atau Cmd+P (Mac)
✅ Selesai!
```

---

### Jadwal Per Tanggal (Detail)

**Buat Jadwal Otomatis:**
```
1. Klik "Jadwal Otomatis"
2. Pilih tanggal mulai
3. Pilih interval (contoh: Setiap Minggu)
4. Pilih waktu
5. Klik "Buat X Jadwal"
✅ Selesai!
```

**Buat Jadwal Manual:**
```
1. Klik "Buat Manual"
2. Pilih guru
3. Pilih tanggal & waktu
4. Klik "Simpan"
✅ Selesai!
```

---

## 💡 Tips Cepat

### Untuk Sekolah Kecil (< 10 guru)
👉 **Pakai:** Jadwal Per Tanggal saja
- Lebih detail
- Reminder otomatis
- Tracking status

### Untuk Sekolah Besar (> 20 guru)
👉 **Pakai:** Keduanya
1. Jadwal Tahunan untuk planning
2. Jadwal Per Tanggal untuk eksekusi

### Untuk Laporan Yayasan
👉 **Pakai:** Jadwal Tahunan
- Format tabel rapi
- Mudah dicetak
- Professional

---

## 🔧 Troubleshooting Cepat

### ❌ Guru tidak muncul di dropdown
**Fix:** Pastikan guru sudah terdaftar di sistem (menu Daftar Akun)

### ❌ Tidak bisa simpan jadwal
**Fix:** Cek koneksi internet, refresh halaman

### ❌ Print tidak rapi
**Fix:** Gunakan Chrome/Edge, set orientasi Landscape

### ❌ Menu tidak muncul
**Fix:** Pastikan login sebagai principal/admin (bukan foundation)

---

## 📞 Butuh Bantuan?

**Dokumentasi Lengkap:**
- `JADWAL_SUPERVISI_GUIDE.md` - Panduan detail
- `PANDUAN_SUPERVISOR_TAHFIDZ.md` - Panduan supervisor
- `DEPLOYMENT_JADWAL_TAHUNAN.md` - Panduan deployment

**Video Tutorial:** (coming soon)

**Support:** dev@giat-lapor.com

---

## ✅ Selesai!

Sistem jadwal supervisi Anda sekarang **dinamis** dan **fleksibel**!

**Pilih mode yang sesuai kebutuhan:**
- 📆 Jadwal Per Tanggal → Detail & Operasional
- 📊 Jadwal Tahunan → Referensi & Visual

**Atau pakai keduanya untuk hasil maksimal!** 🎉

---

**Version:** 1.0  
**Last Updated:** 24 November 2025
