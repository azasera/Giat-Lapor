# Template Google Sheets untuk Laporan Kepala Sekolah

## Langkah Membuat Template:

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru
3. Nama: "Template Laporan Kepala Sekolah"

## Header Columns (Baris 1):
```
A1: ID
B1: Tanggal
C1: Kepala Sekolah  
D1: Sekolah
E1: Periode
F1: Jumlah Kegiatan
G1: Jumlah Prestasi
H1: Rata-rata Kinerja
I1: Status
J1: Kegiatan Utama
K1: Prestasi Unggulan
L1: Kendala
M1: Rencana Tindak Lanjut
```

## Format Template:
- Row 1: Headers (bold, background biru muda)
- Row 2: Contoh data
- Freeze row 1
- Set column widths sesuai kebutuhan
- Add data validation untuk kolom Status (Draft/Review/Approved)

## Setelah template siap:
1. File → Share → Copy link
2. Extract spreadsheet ID dari URL
3. Update `SHEETS_TEMPLATE_ID` di konfigurasi