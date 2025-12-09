# Panduan Tanda Tangan di PDF RAB

## Kenapa Tanda Tangan Belum Tampil?

Tanda tangan di PDF RAB akan tampil **HANYA JIKA** tanda tangan sudah diisi di form RAB. Berikut penjelasannya:

## Cara Mengisi Tanda Tangan

1. **Buka halaman RAB** (buat baru atau edit yang sudah ada)
2. **Scroll ke bawah** sampai menemukan bagian "Tanda Tangan"
3. **Isi tanda tangan** dengan salah satu cara:
   - **Gambar langsung**: Klik di area tanda tangan dan gambar dengan mouse/touchpad
   - **Upload gambar**: Klik tombol upload dan pilih file gambar tanda tangan
4. **Simpan RAB** dengan klik tombol "Simpan RAB"
5. **Download PDF** - tanda tangan akan muncul di PDF

## 5 Tanda Tangan yang Diperlukan

1. **Kabid Umum** - Novan Herwando, S.E.
2. **Bendahara Yayasan** - Ikhwan Fadhillah, S.E.
3. **Sekretaris Yayasan** - Fathurrohman, S.E.
4. **Ketua Yayasan** - Ustadz Ali Agustian Bahri, Lc.
5. **Kepala MTA** - Azali Abdul Ghani

## Tampilan di PDF

- **Jika tanda tangan sudah diisi**: Gambar tanda tangan akan muncul
- **Jika tanda tangan belum diisi**: Kotak placeholder abu-abu akan muncul dengan nama dan jabatan

## Siapa yang Bisa Mengisi Tanda Tangan?

### Kepala Sekolah (Principal)
- Bisa mengisi tanda tangan **Kabid Umum** dan **Kepala MTA**
- Hanya saat RAB berstatus **Draft** atau **Ditolak**

### Yayasan (Foundation)
- Bisa mengisi tanda tangan **Bendahara Yayasan**, **Sekretaris Yayasan**, dan **Ketua Yayasan**
- Saat RAB berstatus **Dikirim** (Submitted)

### Admin
- Bisa mengisi semua tanda tangan
- Kapan saja

## Troubleshooting

### Tanda tangan tidak muncul di PDF?
1. Pastikan tanda tangan sudah diisi di form
2. Pastikan sudah klik "Simpan RAB" setelah mengisi tanda tangan
3. Coba refresh halaman dan download PDF lagi
4. Buka Console Browser (F12) dan lihat log untuk debugging

### Tidak bisa mengisi tanda tangan?
1. Cek role/peran Anda (Principal, Foundation, atau Admin)
2. Cek status RAB (Draft, Dikirim, Disetujui, atau Ditolak)
3. Pastikan Anda memiliki hak akses untuk mengisi tanda tangan tersebut

## Database Setup

Jika Anda baru setup database, jalankan SQL berikut di Supabase:

```sql
-- File: ADD_RAB_STATUS_COLUMNS.sql
-- Menambahkan kolom status dan review ke tabel rab_data
```

Jalankan file `ADD_RAB_STATUS_COLUMNS.sql` di Supabase SQL Editor untuk menambahkan kolom yang diperlukan.

## Debugging

Saat download PDF, buka Console Browser (F12) untuk melihat log:
- `Signature data check`: Menampilkan tanda tangan mana yang sudah diisi
- `Signature X added successfully`: Tanda tangan berhasil ditambahkan ke PDF
- `No signature data for X`: Tanda tangan belum diisi, placeholder akan muncul
- `Error adding signature X`: Ada error saat menambahkan tanda tangan

## Contoh Workflow

### Workflow Normal:
1. **Kepala Sekolah** membuat RAB baru (status: Draft)
2. **Kepala Sekolah** mengisi data belanja
3. **Kepala Sekolah** mengisi tanda tangan Kabid Umum dan Kepala MTA
4. **Kepala Sekolah** klik "Simpan RAB"
5. **Kepala Sekolah** klik "Kirim ke Yayasan" (status: Dikirim)
6. **Yayasan** membuka RAB yang dikirim
7. **Yayasan** mengisi tanda tangan Bendahara, Sekretaris, dan Ketua Yayasan
8. **Yayasan** klik "Setujui RAB" (status: Disetujui)
9. **Siapa saja** bisa download PDF dengan semua tanda tangan lengkap

### Workflow Jika Ditolak:
1. **Yayasan** menolak RAB dengan memberikan komentar (status: Ditolak)
2. **Kepala Sekolah** membuka RAB yang ditolak
3. **Kepala Sekolah** memperbaiki data sesuai komentar
4. **Kepala Sekolah** klik "Kirim Ulang ke Yayasan"
5. Proses review ulang oleh Yayasan

## Tips

- Gunakan gambar tanda tangan dengan background transparan (PNG) untuk hasil terbaik
- Ukuran gambar tanda tangan sebaiknya tidak terlalu besar (max 500KB)
- Pastikan tanda tangan jelas dan mudah dibaca
- Simpan RAB secara berkala untuk menghindari kehilangan data
