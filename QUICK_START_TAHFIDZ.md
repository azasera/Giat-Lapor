# 🚀 Quick Start - Supervisi Guru Tahfidz

## 📋 Langkah-Langkah Setup

### 1. Setup Database (5 menit)

1. Buka Supabase Dashboard
2. Pilih project Anda
3. Buka SQL Editor
4. Copy-paste isi file `supabase_schema_tahfidz_supervision.sql`
5. Klik "Run" untuk execute

✅ Database siap!

---

### 2. Test Aplikasi (10 menit)

#### A. Login sebagai Principal/Admin
```
1. Buka aplikasi
2. Login dengan akun principal atau admin
3. Lihat menu sidebar → "Supervisi Tahfidz"
```

#### B. Buat Jadwal Supervisi
```
1. Klik "Supervisi Tahfidz"
2. Klik "Jadwal"
3. Klik "Buat Jadwal"
4. Isi:
   - Pilih Guru Tahfidz
   - Tanggal: [pilih tanggal]
   - Waktu: [opsional]
   - Catatan: [opsional]
5. Klik "Simpan"
```

#### C. Lakukan Supervisi
```
1. Klik "Buat Supervisi"
2. Isi data dasar:
   - Pilih Guru
   - Tanggal Supervisi
   - Periode: "Semester 1" atau "Januari"
   - Tahun: 2024
3. Scroll ke bawah
4. Beri nilai 1-5 untuk setiap indikator (46 indikator)
5. Lihat skor otomatis terhitung di atas
6. Isi ringkasan:
   - Kekuatan
   - Area yang Perlu Diperbaiki
   - Rekomendasi
   - Rencana Tindak Lanjut
7. Klik "Simpan Draft" atau "Submit"
```

#### D. Generate Laporan Yayasan
```
1. Klik "Laporan Yayasan"
2. Klik "Buat Laporan"
3. Isi:
   - Periode: "Januari" atau "Semester 1"
   - Tahun: 2024
   - Tipe: Bulanan/Semester/Tahunan
   - Kekuatan Institusi
   - Area Perbaikan
   - Rekomendasi
   - Rencana Tindak Lanjut
4. Klik "Generate Laporan"
5. Sistem akan otomatis menghitung statistik
6. Klik "Kirim ke Yayasan" untuk submit
```

#### E. Generate Sertifikat
```
1. Dari daftar supervisi
2. Cari supervisi dengan kategori "Mumtaz" atau "Jayyid Jiddan"
3. Klik icon sertifikat (🏆)
4. Sertifikat otomatis dibuat
5. Lihat di menu "Sertifikat" (future feature)
```

---

## 🎯 Contoh Data Test

### Jadwal Supervisi
```
Guru: Ustadz Ahmad
Tanggal: 2024-12-01
Waktu: 08:00
Catatan: Fokus pada metodologi pengajaran
```

### Supervisi
```
Guru: Ustadz Ahmad
Periode: Semester 1
Tahun: 2024

Penilaian (contoh):
- Kategori 1, Indikator 1: 5 (Mumtaz)
- Kategori 1, Indikator 2: 4 (Jayyid Jiddan)
- ... (isi semua 46 indikator)

Kekuatan:
"Guru sangat disiplin dan memiliki bacaan yang sangat baik. 
Santri merasa nyaman dan termotivasi."

Area Perbaikan:
"Perlu meningkatkan variasi metode pengajaran dan 
manajemen waktu untuk muraja'ah."

Rekomendasi:
"Ikuti pelatihan metode tahfidz modern dan 
workshop manajemen kelas."

Rencana Tindak Lanjut:
"1. Daftarkan ke pelatihan bulan depan
2. Observasi guru senior
3. Evaluasi ulang 3 bulan ke depan"
```

---

## 📊 Interpretasi Hasil

### Kategori Hasil
- **90-100%** = Mumtaz (Sangat Baik) → Guru teladan ⭐⭐⭐⭐⭐
- **80-89%** = Jayyid Jiddan (Baik Sekali) → Perlu sedikit perbaikan ⭐⭐⭐⭐
- **70-79%** = Jayyid (Baik) → Perlu beberapa perbaikan ⭐⭐⭐
- **60-69%** = Maqbul (Cukup) → Perlu pembinaan intensif ⭐⭐
- **< 60%** = Dha'if (Perlu Perbaikan) → Perlu perbaikan serius ⭐

### Skor per Indikator
- **5** = Mumtaz → Konsisten menerapkan dengan sempurna
- **4** = Jayyid Jiddan → Sering menerapkan dengan baik
- **3** = Jayyid → Kadang-kadang menerapkan
- **2** = Maqbul → Jarang menerapkan
- **1** = Dha'if → Tidak menerapkan

---

## 🔍 Tips Penilaian

### 1. Objektif
- Nilai berdasarkan observasi nyata
- Jangan terpengaruh hubungan personal
- Gunakan catatan observasi

### 2. Konsisten
- Gunakan standar yang sama untuk semua guru
- Dokumentasikan alasan penilaian
- Bandingkan dengan supervisi sebelumnya

### 3. Konstruktif
- Fokus pada perbaikan, bukan kritik
- Berikan contoh konkret
- Tawarkan solusi praktis

### 4. Lengkap
- Isi semua 46 indikator
- Tambahkan catatan per indikator jika perlu
- Lengkapi ringkasan dan rekomendasi

---

## 🎓 FAQ

### Q: Berapa lama waktu untuk satu supervisi?
**A:** Sekitar 15-20 menit untuk mengisi form (46 indikator + ringkasan)

### Q: Apakah bisa edit supervisi setelah submit?
**A:** Tidak, setelah submit hanya bisa dilihat. Simpan sebagai draft jika masih ingin edit.

### Q: Bagaimana jika guru tidak puas dengan hasil?
**A:** Guru bisa melihat hasil dan mendiskusikan dengan supervisor. Admin bisa edit jika diperlukan.

### Q: Berapa sering harus supervisi?
**A:** Rekomendasi: minimal 1x per semester, ideal 2-3x per semester

### Q: Apakah laporan yayasan otomatis?
**A:** Ya, statistik dihitung otomatis. Anda hanya perlu tambahkan analisis dan rekomendasi.

### Q: Bagaimana cara print sertifikat?
**A:** Saat ini bisa download sebagai text. PDF export dengan design akan ditambahkan.

---

## 🆘 Troubleshooting

### Error: "Gagal menyimpan supervisi"
**Solusi:**
1. Pastikan semua field required terisi
2. Pastikan minimal 1 indikator dinilai
3. Check koneksi internet
4. Refresh halaman dan coba lagi

### Error: "Tidak ada data supervisi untuk periode ini"
**Solusi:**
1. Pastikan ada supervisi dengan status "approved"
2. Pastikan periode dan tahun sesuai
3. Submit supervisi terlebih dahulu

### Menu "Supervisi Tahfidz" tidak muncul
**Solusi:**
1. Pastikan login sebagai Principal atau Admin
2. Refresh halaman
3. Clear cache browser

---

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Check dokumentasi lengkap: `SUPERVISI_GURU_TAHFIDZ_FINAL.md`
2. Check implementasi: `TAHFIDZ_SUPERVISION_IMPLEMENTATION.md`
3. Check database schema: `supabase_schema_tahfidz_supervision.sql`

---

## ✅ Checklist Setup

- [ ] Database schema sudah dijalankan
- [ ] Login sebagai Principal/Admin berhasil
- [ ] Menu "Supervisi Tahfidz" muncul di sidebar
- [ ] Bisa buat jadwal supervisi
- [ ] Bisa buat supervisi baru
- [ ] Skor otomatis terhitung
- [ ] Bisa simpan draft
- [ ] Bisa submit supervisi
- [ ] Bisa lihat daftar supervisi
- [ ] Bisa generate laporan yayasan
- [ ] Bisa generate sertifikat

---

**Selamat menggunakan Sistem Supervisi Guru Tahfidz! 🎉**

*Semoga membantu meningkatkan kualitas pengajaran tahfidz Al-Qur'an* 🤲
