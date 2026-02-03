# Panduan Kirim Memo ke Yayasan

## ✨ Fitur Baru: Kirim Memo ke Yayasan

Sekarang user dapat mengirim memo dan surat resmi langsung ke pihak yayasan melalui aplikasi.

---

## 🔧 Cara Menggunakan:

### 1. Dari Halaman Daftar Memo
1. Buka **Daftar Memo Internal**
2. Cari memo yang ingin dikirim
3. Klik tombol **Kirim ke Yayasan** (ikon Send)
4. Konfirmasi pengiriman
5. Status memo berubah menjadi **"Dikirim ke Yayasan"**

### 2. Dari Halaman Edit Memo
1. Buka memo yang ingin dikirim
2. Pastikan semua data sudah lengkap
3. Klik tombol **"Kirim ke Yayasan"** (biru)
4. Konfirmasi pengiriman
5. Memo otomatis tersimpan dan dikirim

---

## 📋 Status Memo:

### Draft
- Memo masih dalam tahap penyusunan
- Dapat diedit dan dihapus
- Belum dikirim ke yayasan

### Final
- Memo sudah selesai disusun
- Dapat diedit dan dihapus
- Belum dikirim ke yayasan

### Dikirim ke Yayasan
- Memo sudah dikirim ke pihak yayasan
- **Tidak dapat diedit atau dihapus**
- Dapat diduplikasi untuk membuat memo baru
- Yayasan dapat melihat memo ini

---

## 👥 Akses Berdasarkan Role:

### Principal (Kepala Sekolah)
- ✅ Dapat membuat memo baru
- ✅ Dapat mengedit memo sendiri
- ✅ Dapat mengirim memo ke yayasan
- ✅ Dapat melihat semua memo yang dibuat
- ❌ Tidak dapat melihat memo dari principal lain

### Foundation (Yayasan)
- ❌ Tidak dapat membuat memo baru
- ❌ Tidak dapat mengedit memo
- ✅ Dapat melihat memo yang dikirim ke yayasan
- ✅ Dapat download PDF memo
- ✅ Dapat duplikasi memo untuk referensi

### Admin
- ✅ Dapat melakukan semua aksi
- ✅ Dapat melihat semua memo
- ✅ Dapat mengirim memo ke yayasan
- ✅ Dapat mengedit memo yang belum dikirim

---

## ⚠️ Penting:

### Sebelum Mengirim:
- Pastikan **Nomor Memo** sudah diisi
- Pastikan **Perihal** sudah diisi
- Periksa kembali semua data dalam memo
- Pastikan tanda tangan dan stempel sudah diupload

### Setelah Dikirim:
- Memo **tidak dapat diubah** lagi
- Memo **tidak dapat dihapus**
- Status berubah menjadi **"Dikirim ke Yayasan"**
- Yayasan dapat melihat memo tersebut
- Timestamp pengiriman tercatat otomatis

---

## 🔄 Workflow:

```
1. Principal membuat memo → Status: Draft
2. Principal melengkapi data → Status: Final (opsional)
3. Principal kirim ke yayasan → Status: Dikirim ke Yayasan
4. Yayasan menerima dan dapat melihat memo
5. Memo terkunci, tidak dapat diubah
```

---

## 💡 Tips:

### Untuk Principal:
- Gunakan fitur **Preview PDF** sebelum mengirim
- Pastikan semua data sudah benar sebelum mengirim
- Gunakan **Duplikasi** untuk membuat memo serupa

### Untuk Yayasan:
- Cek secara berkala memo yang masuk
- Download PDF untuk arsip
- Gunakan fitur pencarian untuk mencari memo tertentu

---

## 🛠️ Database Changes:

Ditambahkan kolom baru:
- `sent_to_foundation_at`: Timestamp pengiriman ke yayasan
- Status baru: `'sent_to_foundation'`

---

## 🚀 Deployment:

1. Jalankan migration SQL: `ADD_SENT_TO_FOUNDATION_COLUMN.sql`
2. Deploy aplikasi dengan fitur baru
3. Test workflow pengiriman memo
4. Informasikan ke user tentang fitur baru