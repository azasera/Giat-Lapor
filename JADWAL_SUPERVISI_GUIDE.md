# 📅 Panduan Dua Jenis Jadwal Supervisi

## Ringkasan

Sistem Supervisi Guru Tahfidz menyediakan **2 jenis jadwal** yang dapat digunakan sesuai kebutuhan:

### 1. 📆 Jadwal Per Tanggal (Detail)
**URL:** `/tahfidz-supervision-schedule`

**Untuk apa?**
- Jadwal supervisi dengan **tanggal dan waktu spesifik**
- Cocok untuk **penjadwalan operasional** sehari-hari
- Bisa set reminder dan tracking status

**Fitur:**
- ✅ Tanggal dan waktu spesifik (contoh: 15 Desember 2025, 08:00)
- ✅ Status: Terjadwal, Selesai, Dibatalkan, Dijadwal Ulang
- ✅ Area fokus per jadwal
- ✅ Catatan per jadwal
- ✅ Reminder otomatis (H-3, H-1, hari H)
- ✅ Link ke hasil supervisi
- ✅ Jadwal otomatis untuk semua guru dengan interval

**Kapan digunakan?**
- Saat Anda ingin jadwal yang **detail dan terstruktur**
- Perlu **tracking status** supervisi
- Ingin **reminder otomatis**
- Perlu koordinasi waktu yang **presisi**

---

### 2. 📊 Jadwal Tahunan (Referensi)
**URL:** `/tahfidz-annual-schedule`

**Untuk apa?**
- Jadwal supervisi dalam **format tabel bulanan**
- Cocok untuk **perencanaan tahunan** dan **referensi visual**
- Mirip dengan jadwal di papan pengumuman

**Fitur:**
- ✅ Format tabel 12 bulan (Januari - Desember)
- ✅ Bisa multiple guru per bulan
- ✅ Auto distribusi guru ke bulan-bulan
- ✅ Print-friendly (bisa dicetak)
- ✅ Simpan dan load jadwal tahunan
- ✅ Edit langsung di tabel

**Kapan digunakan?**
- Saat Anda ingin **overview tahunan**
- Perlu **jadwal referensi** yang mudah dibaca
- Ingin **cetak jadwal** untuk ditempel
- Perencanaan **jangka panjang**

---

## 🔄 Perbandingan

| Aspek | Jadwal Per Tanggal | Jadwal Tahunan |
|-------|-------------------|----------------|
| **Format** | List dengan tanggal spesifik | Tabel bulanan |
| **Detail** | Sangat detail (tanggal, waktu, status) | Ringkas (bulan, nama guru) |
| **Tujuan** | Operasional harian | Perencanaan tahunan |
| **Reminder** | ✅ Ada | ❌ Tidak ada |
| **Status Tracking** | ✅ Ada | ❌ Tidak ada |
| **Print** | Kurang ideal | ✅ Sangat ideal |
| **Edit** | Per item | Langsung di tabel |
| **Multiple Guru/Periode** | 1 guru per jadwal | Multiple guru per bulan |

---

## 💡 Rekomendasi Penggunaan

### Skenario 1: Sekolah Kecil (5-10 Guru)
**Gunakan:** Jadwal Per Tanggal
- Lebih mudah koordinasi waktu spesifik
- Reminder membantu tidak terlewat
- Tracking status lebih detail

### Skenario 2: Sekolah Besar (20+ Guru)
**Gunakan:** Kedua-duanya
1. **Jadwal Tahunan** untuk perencanaan awal dan referensi
2. **Jadwal Per Tanggal** untuk eksekusi detail

### Skenario 3: Perlu Laporan ke Yayasan
**Gunakan:** Jadwal Tahunan
- Format tabel lebih mudah dibaca
- Bisa dicetak dan dilampirkan
- Overview yang jelas

### Skenario 4: Supervisi Intensif
**Gunakan:** Jadwal Per Tanggal
- Perlu tracking status detail
- Reminder penting
- Follow-up lebih mudah

---

## 📝 Cara Menggunakan

### A. Jadwal Per Tanggal

#### 1. Buat Jadwal Otomatis (Rekomendasi)
```
1. Klik "Jadwal Otomatis"
2. Pilih tanggal mulai (contoh: 1 Januari 2025)
3. Pilih interval (contoh: Setiap Minggu)
4. Pilih waktu (contoh: 08:00)
5. Isi area fokus (opsional)
6. Klik "Buat X Jadwal"
```

**Hasil:** Sistem membuat jadwal untuk semua guru dengan interval yang dipilih
- Guru 1: 1 Januari 2025, 08:00
- Guru 2: 8 Januari 2025, 08:00
- Guru 3: 15 Januari 2025, 08:00
- dst...

#### 2. Buat Jadwal Manual
```
1. Klik "Buat Manual"
2. Pilih guru
3. Pilih tanggal dan waktu
4. Isi area fokus dan catatan
5. Klik "Simpan"
```

#### 3. Edit/Hapus Jadwal
- Klik icon pensil untuk edit
- Klik icon sampah untuk hapus

---

### B. Jadwal Tahunan

#### 1. Auto Distribusi (Rekomendasi)
```
1. Isi nama lembaga (contoh: Mahad Tahfidul Quran)
2. Pilih tahun (contoh: 2025)
3. Klik "Auto Distribusi"
```

**Hasil:** Sistem distribusi semua guru ke 12 bulan secara merata
- Setiap guru muncul 4x dalam setahun (setiap 3 bulan)

#### 2. Tambah Manual
```
1. Klik dropdown di cell bulan yang diinginkan
2. Pilih nama guru
3. Guru akan muncul di cell tersebut
```

#### 3. Hapus Guru dari Bulan
- Hover ke nama guru
- Klik icon sampah yang muncul

#### 4. Simpan Jadwal
```
1. Klik "Simpan"
2. Jadwal tersimpan dan muncul di "Jadwal Tersimpan"
```

#### 5. Load Jadwal Tersimpan
```
1. Scroll ke "Jadwal Tersimpan"
2. Klik icon pensil untuk load dan edit
```

#### 6. Print Jadwal
```
1. Tekan Ctrl+P (Windows) atau Cmd+P (Mac)
2. Atau klik menu Print di browser
3. Jadwal akan tercetak dalam format tabel yang rapi
```

---

## 🔗 Navigasi Antar Jadwal

### Dari Jadwal Per Tanggal ke Jadwal Tahunan:
- Klik tombol **"Jadwal Tahunan"** (warna kuning/amber)

### Dari Jadwal Tahunan ke Jadwal Per Tanggal:
- Klik tombol **"Jadwal Per Tanggal"** (warna biru)

### Dari Dashboard:
1. Klik menu **"Supervisi Tahfidz"** di sidebar
2. Pilih submenu:
   - **"Jadwal Per Tanggal"**
   - **"Jadwal Tahunan"**

---

## 🎯 Tips & Best Practices

### Untuk Jadwal Per Tanggal:
1. ✅ Gunakan fitur "Jadwal Otomatis" untuk efisiensi
2. ✅ Pilih interval yang realistis (7-14 hari)
3. ✅ Isi area fokus untuk supervisi yang terarah
4. ✅ Update status setelah supervisi selesai
5. ✅ Manfaatkan reminder untuk tidak terlewat

### Untuk Jadwal Tahunan:
1. ✅ Gunakan "Auto Distribusi" untuk distribusi merata
2. ✅ Cetak dan tempel di ruang guru untuk referensi
3. ✅ Update setiap awal tahun ajaran
4. ✅ Koordinasikan dengan kalender akademik
5. ✅ Simpan versi berbeda untuk perbandingan

---

## 🔧 Troubleshooting

### Q: Jadwal otomatis tidak muncul?
**A:** Pastikan:
- Sudah ada guru di sistem
- Tanggal mulai sudah dipilih
- Interval sudah dipilih
- Refresh halaman

### Q: Tidak bisa print jadwal tahunan?
**A:** 
- Gunakan browser Chrome/Edge (lebih baik)
- Pastikan orientasi landscape
- Atur margin minimal

### Q: Guru tidak muncul di dropdown?
**A:**
- Pastikan guru sudah terdaftar di sistem
- Refresh halaman
- Cek role user (harus principal/admin)

### Q: Jadwal tersimpan tidak muncul?
**A:**
- Pastikan sudah klik "Simpan"
- Refresh halaman
- Cek koneksi internet

---

## 📊 Contoh Workflow

### Workflow 1: Perencanaan Awal Tahun
```
1. Buat Jadwal Tahunan
   - Auto distribusi semua guru
   - Cetak untuk referensi
   
2. Buat Jadwal Per Tanggal (per semester)
   - Jadwal otomatis untuk semester 1
   - Set reminder aktif
   
3. Eksekusi supervisi sesuai jadwal per tanggal
   - Update status setelah selesai
   - Isi form supervisi
```

### Workflow 2: Supervisi Rutin Bulanan
```
1. Cek Jadwal Tahunan
   - Lihat guru mana yang dijadwalkan bulan ini
   
2. Buat Jadwal Per Tanggal untuk bulan ini
   - Tentukan tanggal spesifik
   - Set waktu yang sesuai
   
3. Lakukan supervisi
   - Ikuti jadwal per tanggal
   - Manfaatkan reminder
```

---

## 📞 Bantuan

Jika ada pertanyaan atau kendala:
- Hubungi admin sistem
- Baca dokumentasi lengkap di PANDUAN_SUPERVISOR_TAHFIDZ.md
- Lihat video tutorial (jika tersedia)

---

**Versi:** 1.0  
**Terakhir Diperbarui:** 24 November 2025  
**Penyusun:** Tim Pengembang Giat Lapor
