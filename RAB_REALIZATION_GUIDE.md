# Panduan Realisasi RAB

## Deskripsi
Fitur Realisasi RAB memungkinkan pengguna untuk mencatat dan melacak pengeluaran aktual dari Rencana Anggaran Belanja (RAB) yang telah disetujui.

## Fitur Utama

### 1. Membuat Realisasi Baru
- Hanya RAB dengan status "Disetujui" yang dapat direalisasikan
- Pilih RAB dari daftar RAB yang sudah disetujui
- Sistem otomatis membuat item realisasi berdasarkan item belanja di RAB

### 2. Input Realisasi
- **Realisasi**: Masukkan jumlah pengeluaran aktual
- **Tanggal**: Tanggal terjadinya pengeluaran
- **Catatan**: Catatan tambahan untuk setiap item pengeluaran
- **Bukti**: (Opsional) Upload bukti pembayaran/kuitansi

### 3. Monitoring
- **Total Rencana**: Total anggaran yang direncanakan
- **Total Realisasi**: Total pengeluaran aktual
- **Selisih**: Perbedaan antara rencana dan realisasi
  - Hijau: Hemat (realisasi < rencana)
  - Merah: Over budget (realisasi > rencana)

### 4. Status Realisasi
- **Dalam Proses**: Sedang diisi oleh kepala sekolah
- **Dikirim**: Sudah dikirim ke yayasan untuk verifikasi
- **Disetujui**: Disetujui oleh yayasan
- **Selesai**: Realisasi selesai dan diarsipkan

## Alur Kerja

### Untuk Kepala Sekolah:
1. Buka menu "Realisasi"
2. Klik "Buat Realisasi Baru"
3. Pilih RAB yang sudah disetujui
4. Isi data realisasi untuk setiap item belanja
5. Simpan secara berkala
6. Kirim ke yayasan setelah selesai

### Untuk Yayasan:
1. Buka menu "Realisasi"
2. Lihat daftar realisasi yang dikirim
3. Klik "Lihat" untuk melihat detail
4. Verifikasi data realisasi
5. Setujui atau minta revisi

## Database Schema

### Tabel: rab_realizations
- `id`: UUID primary key
- `rab_id`: Referensi ke RAB
- `user_id`: User yang membuat
- `status`: Status realisasi
- `total_planned`: Total rencana
- `total_actual`: Total realisasi
- `variance`: Selisih
- `created_at`, `updated_at`, `submitted_at`, `approved_at`

### Tabel: realization_items
- `id`: UUID primary key
- `realization_id`: Referensi ke realisasi
- `expense_item_id`: Referensi ke item belanja RAB
- `description`: Uraian
- `planned_amount`: Jumlah rencana
- `actual_amount`: Jumlah realisasi
- `actual_date`: Tanggal realisasi
- `receipt`: URL bukti pembayaran
- `notes`: Catatan

## Instalasi Database

Jalankan SQL script berikut di Supabase SQL Editor:

```sql
-- File: supabase_schema_realization.sql
```

Pastikan untuk menjalankan script ini setelah schema RAB sudah ada.

## Integrasi

Fitur realisasi terintegrasi dengan:
- **RAB**: Mengambil data dari RAB yang disetujui
- **User Management**: RLS policies untuk keamanan data
- **Toast Notifications**: Feedback untuk user actions

## Tips Penggunaan

1. **Simpan Berkala**: Simpan data secara berkala untuk menghindari kehilangan data
2. **Dokumentasi**: Tambahkan catatan detail untuk setiap pengeluaran
3. **Bukti**: Upload bukti pembayaran untuk transparansi
4. **Review**: Periksa selisih anggaran secara berkala
5. **Komunikasi**: Gunakan catatan untuk komunikasi dengan yayasan

## Troubleshooting

### Tidak bisa membuat realisasi baru
- Pastikan ada RAB dengan status "Disetujui"
- Periksa koneksi internet
- Refresh halaman

### Data tidak tersimpan
- Periksa koneksi database
- Pastikan semua field required terisi
- Cek console browser untuk error

### Selisih tidak akurat
- Pastikan input angka benar
- Refresh halaman untuk recalculate
- Periksa data di database

## Keamanan

- Row Level Security (RLS) aktif untuk semua tabel
- User hanya bisa melihat realisasi mereka sendiri
- Yayasan bisa melihat semua realisasi yang dikirim
- Admin memiliki akses penuh
