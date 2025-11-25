# AI Focus Area Recommendation

## Fitur Baru: AI Assistant untuk Menentukan Area Fokus

Sistem AI akan menganalisis data supervisi sebelumnya dan merekomendasikan area fokus yang paling relevan dan akurat untuk supervisi berikutnya.

---

## Cara Kerja AI

### 1. Analisis Data Supervisi Sebelumnya
AI menganalisis:
- Skor per kategori dari supervisi sebelumnya
- Indikator dengan nilai rendah
- Trend perkembangan guru
- Area yang konsisten lemah

### 2. Prioritas Rekomendasi

**Priority HIGH (Merah):**
- Area dengan skor < 60% (Kritis)
- Memerlukan perbaikan segera
- Fokus intensif diperlukan

**Priority MEDIUM (Kuning):**
- Area dengan skor 60-80%
- Perlu peningkatan
- Fokus untuk optimalisasi

**Priority LOW (Hijau):**
- Semua area > 80%
- Fokus pada maintenance dan continuous improvement
- Peningkatan area dengan skor terendah relatif

### 3. Rekomendasi Spesifik

AI tidak hanya merekomendasikan kategori umum, tetapi memberikan fokus spesifik:

**Contoh:**
- Bukan hanya "Metodologi Pengajaran"
- Tapi "Teknik Muraja'ah Efektif" (berdasarkan indikator terlemah)

---

## Cara Menggunakan

### Di Halaman Jadwal Otomatis:

1. **Buka Form Jadwal Otomatis**
   - Klik "Jadwal Otomatis Semua Guru"

2. **Klik Tombol "AI Recommend"**
   - Tombol ungu dengan icon sparkles (✨)
   - Terletak di samping label "Area Fokus"

3. **AI Menganalisis**
   - Sistem mengambil semua data supervisi sebelumnya
   - Menganalisis skor per kategori
   - Mengidentifikasi area lemah
   - Generate rekomendasi

4. **Review Rekomendasi**
   - AI menampilkan:
     - 3 Area Fokus yang direkomendasikan
     - Reasoning (alasan rekomendasi)
     - Priority Level (High/Medium/Low)
   - Warna badge menunjukkan prioritas:
     - 🔴 Merah: Priority HIGH
     - 🟡 Kuning: Priority MEDIUM
     - 🟢 Hijau: Priority LOW

5. **Area Fokus Terisi Otomatis**
   - 3 input area fokus terisi otomatis
   - Anda bisa edit manual jika perlu
   - Atau klik "AI Recommend" lagi untuk rekomendasi baru

6. **Lanjutkan Membuat Jadwal**
   - Isi data lainnya (tanggal, interval, dll)
   - Klik "Buat X Jadwal"

---

## Contoh Rekomendasi AI

### Skenario 1: Guru Baru (Belum Ada Data)

**AI Recommendation:**
```
Priority: HIGH

Area Fokus:
1. Evaluasi Umum Semua Aspek
2. Penilaian Kondisi Awal
3. Identifikasi Kekuatan dan Kelemahan

Reasoning:
Belum ada data supervisi sebelumnya. Rekomendasi: Lakukan evaluasi 
menyeluruh untuk mendapatkan data kondisi awal sebagai acuan.
```

---

### Skenario 2: Guru dengan Area Kritis

**Data Supervisi Sebelumnya:**
- Kompetensi Linguistik: 55% (Kritis)
- Metodologi Pengajaran: 58% (Kritis)
- Manajemen Kelas: 65% (Lemah)

**AI Recommendation:**
```
Priority: HIGH

Area Fokus:
1. Kualitas Bacaan dan Tajwid
2. Teknik Muraja'ah Efektif
3. Pengelolaan Waktu Pembelajaran

Reasoning:
Ditemukan 2 area kritis dengan skor < 60%. Prioritas tinggi untuk 
perbaikan segera pada: Kompetensi Linguistik Qur'ani, Metodologi 
Pengajaran Tahfidz.
```

---

### Skenario 3: Guru dengan Performa Baik

**Data Supervisi Sebelumnya:**
- Semua kategori: 70-78%
- Tidak ada area kritis

**AI Recommendation:**
```
Priority: MEDIUM

Area Fokus:
1. Sistem Setoran Hafalan
2. Komunikasi dengan Orang Tua
3. Dokumentasi Progress Santri

Reasoning:
Performa baik secara keseluruhan. Fokus pada peningkatan area yang 
masih bisa dioptimalkan (skor 70-80%): Sistem Penilaian & Evaluasi, 
Komunikasi & Koordinasi.
```

---

### Skenario 4: Guru Excellent

**Data Supervisi Sebelumnya:**
- Semua kategori: > 80%
- Performa sangat baik

**AI Recommendation:**
```
Priority: LOW

Area Fokus:
1. Pengembangan Kompetensi Diri
2. Inovasi Metode Pembelajaran
3. Mentoring Guru Junior

Reasoning:
Performa excellent di semua area (skor > 80%). Fokus pada: 
Mempertahankan kualitas dan peningkatan berkelanjutan pada area 
dengan skor terendah relatif.
```

---

## Algoritma AI

### 1. Data Collection
```typescript
// Ambil semua supervisi sebelumnya
const previousSupervisions = await fetchSupervisions(userId, role);
```

### 2. Score Analysis
```typescript
// Analisis skor per kategori
const categoryScores = analyzeScores(allItems);
const weakCategories = categories.filter(c => c.percentage < 70);
const criticalAreas = categories.filter(c => c.percentage < 60);
```

### 3. Focus Area Mapping
```typescript
// Map kategori ke fokus spesifik
const focusArea = mapCategoryToFocusArea(categoryName, weakestIndicator);

// Contoh:
// Kategori: "Metodologi Pengajaran Tahfidz"
// Indikator terlemah: "Mampu menerapkan teknik muraja'ah"
// Fokus Area: "Teknik Muraja'ah Efektif"
```

### 4. Priority Determination
```typescript
if (criticalAreas.length > 0) {
  priority = 'high';
} else if (weakCategories.length > 0) {
  priority = 'high';
} else if (needsImprovement.length > 0) {
  priority = 'medium';
} else {
  priority = 'low';
}
```

### 5. Reasoning Generation
```typescript
// Generate penjelasan berdasarkan analisis
const reasoning = generateReasoning(analysis, priority);
```

---

## Mapping Kategori ke Fokus Spesifik

### Kompetensi Kepribadian & Spiritual
- Memiliki akhlak mulia → **Pembinaan Akhlak Guru**
- Disiplin dalam kehadiran → **Kedisiplinan dan Ketepatan Waktu**
- Menjadi teladan → **Keteladanan dalam Mengajar**
- Menjaga adab → **Adab Mengajar Al-Qur'an**
- Konsisten dalam amalan → **Konsistensi Amalan Harian**

### Metodologi Pengajaran Tahfidz
- Menguasai berbagai metode → **Variasi Metode Talaqqi**
- Mampu menerapkan teknik → **Teknik Muraja'ah Efektif**
- Menggunakan pendekatan → **Pendekatan Pembelajaran Inovatif**
- Kreatif dalam menyampaikan → **Kreativitas Penyampaian Materi**
- Metode yang digunakan efektif → **Efektivitas Metode Pengajaran**

### Kompetensi Linguistik Qur'ani
- Memiliki bacaan → **Kualitas Bacaan Al-Qur'an**
- Menguasai tajwid → **Penguasaan Ilmu Tajwid**
- Makhraj huruf → **Makhraj Huruf yang Benar**
- Bacaan tartil → **Tartil dan Kelancaran Bacaan**
- Kualitas qira'ah → **Kualitas Qira'ah dan Lagu**

### Manajemen Kelas Tahfidz
- Mampu mengelola kelas → **Pengelolaan Kelas yang Baik**
- Mengatur waktu → **Time Management Pembelajaran**
- Pengaturan tempat duduk → **Pengaturan Ruang Kelas**
- Menjaga kedisiplinan → **Disiplin dan Kondusivitas Kelas**
- Menciptakan suasana → **Suasana Belajar Kondusif**

### Dan seterusnya untuk 10 kategori...

---

## Keuntungan Menggunakan AI

### 1. Objektif dan Data-Driven
- Berdasarkan data faktual, bukan asumsi
- Analisis sistematis dan konsisten
- Tidak bias personal

### 2. Efisien
- Hemat waktu analisis manual
- Rekomendasi instant
- Tidak perlu review data satu per satu

### 3. Akurat
- Identifikasi area lemah dengan tepat
- Fokus pada indikator spesifik
- Prioritas yang jelas

### 4. Konsisten
- Standar analisis sama untuk semua guru
- Tidak terpengaruh mood atau kondisi
- Hasil reproducible

### 5. Actionable
- Rekomendasi spesifik dan jelas
- Bukan hanya kategori umum
- Langsung bisa digunakan

---

## Tips Penggunaan

### 1. Gunakan untuk Supervisi Follow-Up
- Sangat efektif untuk supervisi lanjutan
- AI mengidentifikasi area yang belum membaik
- Fokus pada perbaikan berkelanjutan

### 2. Review Rekomendasi AI
- AI memberikan saran, bukan keputusan final
- Anda tetap bisa edit manual
- Pertimbangkan konteks spesifik sekolah

### 3. Kombinasi dengan Observasi Langsung
- AI analisis data kuantitatif
- Anda tambahkan insight kualitatif
- Hasil lebih komprehensif

### 4. Update Data Secara Berkala
- Semakin banyak data, semakin akurat AI
- Lakukan supervisi rutin
- Dokumentasi lengkap

---

## Troubleshooting

**Q: AI tidak memberikan rekomendasi**
- A: Pastikan ada data supervisi sebelumnya
- A: Check koneksi internet
- A: Refresh halaman dan coba lagi

**Q: Rekomendasi AI tidak sesuai**
- A: Edit manual sesuai kebutuhan
- A: AI memberikan saran berdasarkan data
- A: Pertimbangkan konteks spesifik

**Q: Ingin rekomendasi berbeda**
- A: Klik "AI Recommend" lagi untuk variasi
- A: Atau edit manual
- A: Kombinasikan dengan judgment Anda

---

## Technical Details

### Functions
- `recommendFocusAreas()` - Main recommendation engine
- `mapCategoryToFocusArea()` - Map category to specific focus
- `generateFocusNotes()` - Generate notes based on focus areas

### Data Flow
```
Previous Supervisions
    ↓
Score Analysis
    ↓
Weak Area Identification
    ↓
Specific Focus Mapping
    ↓
Priority Determination
    ↓
Reasoning Generation
    ↓
Recommendation Output
```

### Performance
- Analysis time: <500ms
- Data processing: Real-time
- No external API calls (offline capable)

---

## Deployment

🚀 **Status**: DEPLOYED to Production  
🌐 **URL**: https://giat-lapor-m45ykbnyh-azaseras-projects.vercel.app  
📅 **Date**: November 23, 2025

---

**Versi:** 1.0  
**Penyusun:** Tim Pengembang Giat Lapor

---

*AI Assistant membantu supervisor membuat keputusan yang lebih objektif dan data-driven untuk meningkatkan kualitas supervisi.*
