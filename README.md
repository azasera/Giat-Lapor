# 📝 Lapor Giat - Sistem Pelaporan Kegiatan

**Sistem Pelaporan Kegiatan** - Aplikasi web modern untuk dokumentasi dan pelaporan kegiatan dengan nilai-nilai Islam.

## ✨ Fitur Utama

### 📊 Dashboard
- Statistik laporan real-time
- Laporan terbaru dengan status
- Header dengan kaligrafi Arab (Bismillah)
- Tema Islami yang elegan

### 📝 Buat Laporan
- **Informasi Dasar**: Nama kepala sekolah, sekolah, tanggal, periode (Harian, Pekanan, Bulanan, Mid semester, Tahunan, Kegiatan Khusus)
- **Kegiatan**: 8 kategori kegiatan dengan detail lengkap
- **Evaluasi Kinerja**: 6 aspek penilaian (skala 1-10)
- **Prestasi**: Dokumentasi pencapaian dengan bukti
- **Aksi**: Simpan draft atau kirim ke yayasan

### 📋 Daftar Laporan
- Tabel lengkap semua laporan
- Filter berdasarkan status
- Export ke Google Sheets
- Edit laporan existing

### 📈 Analitik
- Grafik kinerja per aspek
- Statistik umum (total kegiatan, prestasi, kepatuhan)
- Visualisasi data yang informatif

## 🎨 Desain & UI

- **Tema**: Modern, elegan, profesional dengan warna Islami (emerald, amber, teal)
- **Dark Mode**: Toggle untuk mode gelap/terang
- **Responsive**: Mobile-friendly design
- **Icons**: Lucide React icons yang konsisten
- **Typography**: Clean dan mudah dibaca

## 🚀 Teknologi

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Storage**: LocalStorage (simulasi)
- **State Management**: React Hooks

## 📦 Instalasi & Menjalankan

### Prerequisites
- Node.js 16+ 
- npm atau yarn

### Setup
```bash
# Clone repository
git clone <repository-url>
cd islamic-principal-report-app

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000` (atau port yang tersedia).

### Build untuk Production
```bash
npm run build
```

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + S`: Simpan laporan
- `Ctrl/Cmd + N`: Buat laporan baru
- `Ctrl/Cmd + D`: Buka dashboard

## 🏗️ Struktur Data

### ReportData Interface
```typescript
interface ReportData {
  id: string;
  date: string;
  principalName: string;
  schoolName: string;
  period: string;
  activities: Activity[];
  achievements: Achievement[];
  challenges: string[];
  plans: string[];
  performance: PerformanceMetrics;
  submittedAt?: string;
  status: 'draft' | 'submitted' | 'approved';
}
```

### Performance Metrics
- Kepemimpinan (Leadership)
- Manajemen Sekolah (Management)
- Nilai-nilai Islam (Islamic Values)
- Bimbingan Akademik (Academic Guidance)
- Keterlibatan Masyarakat (Community Engagement)
- Inovasi Pendidikan (Innovation)

## 🎯 Kategori Kegiatan

1. Pembelajaran & Kurikulum
2. Pengembangan SDM Guru / Staff
3. Sarana Prasarana dan Lingkungan
4. Keuangan & Administrasi
5. Hubungan Masyarakat
6. Pembinaan Karakter Santri
7. Ekstrakurikuler
8. Evaluasi & Monitoring
9. Program Unggulan Pondok
10. Inovasi dan Digitalisasi

## 📅 Periode Laporan

1. **Harian** - Laporan kegiatan harian
2. **Pekanan** - Laporan mingguan
3. **Bulanan** - Laporan bulanan
4. **Mid semester / Satu Semester** - Laporan tengah semester
5. **Tahunan** - Laporan tahunan
6. **Kegiatan Khusus** - Laporan untuk kegiatan khusus/event

## 🌟 Keunggulan

1. **Konteks Islami**: Mengintegrasikan nilai-nilai Islam dalam setiap aspek
2. **User Experience**: Interface yang intuitif dan mudah digunakan
3. **Comprehensive**: Mencakup semua aspek pelaporan kepala sekolah
4. **Professional**: Desain yang elegan dan tidak amatir
5. **Type Safety**: Menggunakan TypeScript untuk keamanan kode
6. **Responsive**: Berfungsi optimal di desktop dan mobile
7. **Accessibility**: Keyboard shortcuts dan navigasi yang mudah

## 📱 Responsive Design

Aplikasi dirancang untuk berfungsi optimal di:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔧 Development

### Scripts Available
- `npm run dev`: Development server
- `npm run build`: Build untuk production
- `npm run preview`: Preview build production

### Code Structure
```
src/
├── components/
│   └── IslamicPrincipalReportApp.tsx
├── App.tsx
├── main.tsx
└── index.css
```

## 🤝 Kontribusi

Proyek ini dikembangkan dengan penuh amanah untuk mendukung sistem pendidikan Islam yang berkualitas.

## 📄 Lisensi

© 2025 Lapor Giat - Dikembangkan dengan penuh amanah

---

**بارك الله فيكم** - Semoga Allah memberkahi usaha kita dalam mengembangkan sistem pendidikan Islam yang berkualitas.