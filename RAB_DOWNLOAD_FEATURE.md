# Fitur Download RAB (PDF & Excel)

## Deskripsi
Fitur download PDF dan Excel telah ditambahkan pada halaman RAB untuk memudahkan ekspor dan pencetakan dokumen Rencana Anggaran Belanja.

## Fitur yang Ditambahkan

### 1. Download PDF
- **Tombol**: Tombol merah dengan ikon FileText di header halaman RAB
- **Konten PDF**:
  - Header dengan judul "RENCANA ANGGARAN BELANJA"
  - Informasi lembaga (Nama, Periode, Tahun, Status)
  - Tabel Belanja Rutin dengan semua item
  - Sub Total Belanja Rutin
  - Tabel Belanja Insidentil dengan semua item
  - Sub Total Belanja Insidentil
  - Total Anggaran keseluruhan
- **Format**: PDF dengan tabel yang rapi menggunakan jspdf-autotable
- **Nama File**: `RAB_[NamaLembaga]_[Periode]_[Tahun].pdf`

### 2. Download Excel
- **Tombol**: Tombol hijau dengan ikon FileSpreadsheet di header halaman RAB
- **Konten Excel**:
  - **Sheet 1 (RAB)**: 
    - Informasi lembaga
    - Daftar lengkap Belanja Rutin
    - Daftar lengkap Belanja Insidentil
    - Sub total dan total anggaran
  - **Sheet 2 (Ringkasan Mingguan)**:
    - Ringkasan kebutuhan dana per pekan
    - Breakdown per sumber dana (Yayasan, BOS, Komite, Donasi)
    - Total per pekan
- **Format**: Excel (.xlsx) dengan kolom yang sudah diatur lebarnya
- **Nama File**: `RAB_[NamaLembaga]_[Periode]_[Tahun].xlsx`

## Teknologi yang Digunakan
- **jsPDF**: Library untuk generate PDF
- **jspdf-autotable**: Plugin untuk membuat tabel di PDF
- **xlsx**: Library untuk generate file Excel

## Lokasi Tombol
Tombol download berada di header halaman RAB, di sebelah kanan judul "RENCANA ANGGARAN BELANJA":
- Tombol PDF (merah) dengan ikon dokumen
- Tombol Excel (hijau) dengan ikon spreadsheet

## Cara Penggunaan
1. Buka halaman RAB (baik untuk edit atau view)
2. Klik tombol "PDF" untuk download dalam format PDF
3. Klik tombol "Excel" untuk download dalam format Excel
4. File akan otomatis terdownload dengan nama yang sesuai

## Catatan
- Kedua tombol tersedia untuk semua status RAB (draft, submitted, approved, rejected)
- Hanya item dengan deskripsi yang terisi yang akan muncul di export
- Format mata uang menggunakan format Indonesia (Rp)
- Toast notification akan muncul saat proses download berhasil atau gagal
