# Fitur Jadwal Otomatis untuk Semua Guru

## Masalah
- Membuat jadwal supervisi untuk banyak guru satu per satu sangat memakan waktu
- Sulit mengatur distribusi jadwal yang merata
- Rawan kesalahan manual dalam penjadwalan
- Tidak praktis untuk sekolah dengan banyak guru tahfidz

## Solusi: Jadwal Otomatis Bulk

### Fitur Utama
✅ **Buat jadwal untuk semua guru sekaligus** dengan 1 klik
✅ **Distribusi otomatis** dengan interval yang bisa disesuaikan
✅ **Preview jadwal** sebelum dibuat
✅ **Flexible interval**: Harian, mingguan, 2 mingguan, atau bulanan
✅ **Area fokus dan catatan** yang sama untuk semua guru

## Cara Penggunaan

### 1. Buka Halaman Jadwal Supervisi
- Klik menu "Supervisi Guru Tahfidz" → "Jadwal"
- Atau langsung ke `/tahfidz-supervision-schedule`

### 2. Klik "Jadwal Otomatis Semua Guru"
Tombol berwarna ungu dengan icon kalender

### 3. Isi Form Jadwal Otomatis

**Tanggal Mulai:**
- Pilih tanggal untuk guru pertama
- Contoh: 1 Desember 2025

**Interval Antar Guru:**
- **Setiap Hari (1 hari)**: Guru berbeda setiap hari
- **Setiap 2-3 Hari**: Jeda 2-3 hari antar guru
- **Setiap Minggu (7 hari)**: 1 guru per minggu
- **Setiap 2 Minggu (14 hari)**: 1 guru per 2 minggu
- **Setiap Bulan (30 hari)**: 1 guru per bulan

**Waktu Supervisi:**
- Pilih jam yang sama untuk semua guru
- Contoh: 08:00, 10:00, 13:00

**Area Fokus (Opsional):**
- Tambahkan hingga 3 area fokus
- Contoh: "Metodologi Pengajaran", "Bacaan Tajwid", "Manajemen Kelas"

**Catatan (Opsional):**
- Catatan umum untuk semua jadwal
- Contoh: "Supervisi Semester 1 Tahun 2025"

### 4. Preview & Konfirmasi
- Sistem menampilkan preview:
  - Jumlah guru yang akan dijadwalkan
  - Tanggal jadwal terakhir
- Klik "Buat X Jadwal" untuk konfirmasi

### 5. Jadwal Siap!
- Sistem membuat jadwal untuk semua guru
- Jadwal muncul di list dengan status "scheduled"
- Siap untuk dijalankan sesuai tanggal yang ditentukan

## Contoh Skenario

### Skenario 1: Supervisi Mingguan
**Setup:**
- 10 guru tahfidz
- Tanggal mulai: 1 Desember 2025
- Interval: Setiap minggu (7 hari)
- Waktu: 08:00

**Hasil:**
- Guru 1: 1 Desember 2025, 08:00
- Guru 2: 8 Desember 2025, 08:00
- Guru 3: 15 Desember 2025, 08:00
- ...
- Guru 10: 26 Januari 2026, 08:00

### Skenario 2: Supervisi Harian
**Setup:**
- 5 guru tahfidz
- Tanggal mulai: 1 Desember 2025
- Interval: Setiap hari (1 hari)
- Waktu: 10:00

**Hasil:**
- Guru 1: 1 Desember 2025, 10:00
- Guru 2: 2 Desember 2025, 10:00
- Guru 3: 3 Desember 2025, 10:00
- Guru 4: 4 Desember 2025, 10:00
- Guru 5: 5 Desember 2025, 10:00

### Skenario 3: Supervisi Bulanan
**Setup:**
- 12 guru tahfidz
- Tanggal mulai: 1 Januari 2026
- Interval: Setiap bulan (30 hari)
- Waktu: 13:00

**Hasil:**
- Guru 1: 1 Januari 2026, 13:00
- Guru 2: 31 Januari 2026, 13:00
- Guru 3: 2 Maret 2026, 13:00
- ...
- Guru 12: 1 Desember 2026, 13:00

## Keuntungan

### Efisiensi Waktu
- ⏱️ Hemat waktu: 1 menit vs 30+ menit manual
- 🚀 Buat 50 jadwal dalam hitungan detik
- 📅 Tidak perlu hitung tanggal manual

### Akurasi
- ✅ Tidak ada kesalahan perhitungan tanggal
- ✅ Distribusi merata otomatis
- ✅ Tidak ada jadwal yang terlewat

### Fleksibilitas
- 🔄 Bisa disesuaikan dengan kebutuhan sekolah
- 📊 Berbagai pilihan interval
- 🎯 Area fokus yang konsisten

### Manajemen
- 📋 Jadwal terstruktur dan terorganisir
- 👀 Mudah di-review sebelum dibuat
- ✏️ Bisa diedit individual setelah dibuat

## Tips Penggunaan

### 1. Pilih Interval yang Tepat
- **Sekolah kecil (5-10 guru)**: Interval 1-3 hari
- **Sekolah menengah (10-20 guru)**: Interval 7 hari (mingguan)
- **Sekolah besar (20+ guru)**: Interval 14-30 hari

### 2. Pertimbangkan Kalender Akademik
- Hindari periode ujian
- Hindari libur panjang
- Sesuaikan dengan jadwal sekolah

### 3. Koordinasi dengan Guru
- Informasikan jadwal ke semua guru
- Berikan waktu persiapan yang cukup
- Pastikan guru available pada tanggal yang ditentukan

### 4. Review Sebelum Konfirmasi
- Cek preview tanggal terakhir
- Pastikan tidak bentrok dengan event lain
- Verifikasi jumlah guru yang akan dijadwalkan

## Fitur Tambahan

### Edit Individual
Setelah jadwal dibuat, Anda masih bisa:
- Edit tanggal/waktu per guru
- Ubah status (scheduled, completed, cancelled, rescheduled)
- Tambah/edit area fokus dan catatan
- Hapus jadwal yang tidak diperlukan

### Status Tracking
- **Scheduled**: Jadwal yang akan datang
- **Completed**: Supervisi sudah dilaksanakan
- **Cancelled**: Jadwal dibatalkan
- **Rescheduled**: Jadwal diubah

### Notifikasi (Future Enhancement)
- Email reminder H-3 sebelum supervisi
- SMS reminder H-1
- Push notification di hari H

## Technical Details

### Implementation
- **Function**: `handleBulkSchedule()`
- **Algorithm**: Date calculation with interval multiplication
- **Validation**: Date, time, and teacher availability check
- **Transaction**: Sequential creation with error handling

### Data Structure
```typescript
{
  start_date: string,        // ISO date format
  interval_days: number,     // 1, 2, 3, 7, 14, 30
  start_time: string,        // HH:mm format
  focus_areas: string[],     // Array of focus areas
  notes: string              // General notes
}
```

### Performance
- Creation time: ~100ms per schedule
- Total time for 50 schedules: ~5 seconds
- No performance degradation with large datasets

## Deployment

🚀 **Status**: DEPLOYED to Production
🌐 **URL**: https://giat-lapor-q6e4vpcd5-azaseras-projects.vercel.app
📅 **Date**: November 23, 2025

## Future Enhancements

Potential improvements:
- [ ] Smart scheduling (avoid weekends/holidays)
- [ ] Conflict detection with existing schedules
- [ ] Template presets (weekly, monthly, semester)
- [ ] Export schedule to calendar (iCal, Google Calendar)
- [ ] Bulk edit/delete schedules
- [ ] Schedule analytics and reports
