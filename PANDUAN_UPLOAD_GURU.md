## 🎉 **FITUR BARU: Upload Guru dari Excel!**

Sekarang Anda bisa menambah banyak guru sekaligus dengan upload file Excel!

---

## 📋 **Cara Menggunakan:**

### **Step 1: Buka Menu Daftar Guru**

1. Login ke aplikasi
2. Klik menu **"Supervisi Tahfidz"** di sidebar
3. Klik submenu **"Daftar Guru"**
4. Atau buka URL: `/teachers`

---

### **Step 2: Download Template Excel**

1. Klik tombol **"Download Template Excel"** (warna biru)
2. File `template_daftar_guru.xlsx` akan terdownload
3. Buka file dengan Excel atau Google Sheets

---

### **Step 3: Isi Data Guru**

Isi kolom **"Nama Guru"** dengan daftar nama guru:

| Nama Guru |
|-----------|
| Ustadz Ahmad |
| Ustadz Budi |
| Ustadz Candra |
| Ustadzah Dewi |
| Ustadzah Eka |
| Ustadz Fajar |
| ... |

**Tips:**
- Bisa isi puluhan atau ratusan guru sekaligus
- Pastikan nama lengkap dan benar
- Jangan ada baris kosong di tengah

**Simpan file** (bisa tetap `.xlsx` atau save as `.csv`)

---

### **Step 4: Upload File**

1. Kembali ke halaman **"Daftar Guru"**
2. Klik **"Choose File"** atau **"Pilih File"**
3. Pilih file Excel yang sudah diisi
4. Klik **"Open"**
5. ✅ **Otomatis terupload!**

**Hasil:**
- Semua guru langsung masuk ke sistem
- Muncul notifikasi: "Berhasil mengupload X guru!"
- Guru muncul di daftar

---

### **Step 5: Gunakan di Jadwal**

Setelah upload, guru bisa langsung digunakan:

#### **A. Jadwal Tahunan:**
1. Buka **"Jadwal Tahunan"**
2. Klik dropdown di bulan
3. Pilih guru dari list (sudah ada nama yang diupload)
4. Simpan

#### **B. Jadwal Per Tanggal:**
1. Buka **"Jadwal Per Tanggal"**
2. Klik **"Jadwal Otomatis"** atau **"Buat Manual"**
3. Pilih guru dari dropdown
4. Simpan

#### **C. Buat Supervisi:**
1. Buka **"Supervisi Tahfidz"** → **"Buat Supervisi"**
2. Pilih guru dari dropdown
3. Isi form supervisi
4. Simpan

---

## ➕ **Tambah Guru Manual (Satu per Satu)**

Jika hanya ingin tambah 1-2 guru:

1. Buka **"Daftar Guru"**
2. Di bagian **"Tambah Manual"**
3. Ketik nama guru (contoh: "Ustadz Ahmad")
4. Klik **"Tambah"** atau tekan **Enter**
5. ✅ Guru langsung masuk

---

## 🗑️ **Hapus Guru**

Jika ada guru yang salah atau sudah tidak aktif:

1. Buka **"Daftar Guru"**
2. Cari guru yang ingin dihapus
3. Klik icon **sampah** (🗑️) di sebelah kanan nama
4. Konfirmasi hapus
5. ✅ Guru terhapus

---

## 📊 **Format Excel yang Didukung:**

### **Format 1: Kolom "Nama Guru"** (Rekomendasi)
```
| Nama Guru |
|-----------|
| Ustadz Ahmad |
```

### **Format 2: Kolom "nama_guru"**
```
| nama_guru |
|-----------|
| Ustadz Ahmad |
```

### **Format 3: Kolom "Nama"**
```
| Nama |
|------|
| Ustadz Ahmad |
```

### **Format 4: Kolom "nama"**
```
| nama |
|------|
| Ustadz Ahmad |
```

**Sistem akan otomatis mendeteksi kolom yang benar!**

---

## ✅ **Keuntungan Fitur Ini:**

- ✅ **Cepat** - Upload puluhan guru dalam sekali klik
- ✅ **Mudah** - Tinggal isi Excel dan upload
- ✅ **Fleksibel** - Bisa tambah manual juga
- ✅ **Praktis** - Tidak perlu registrasi user
- ✅ **Terintegrasi** - Langsung bisa digunakan di jadwal

---

## 🚨 **Troubleshooting:**

### **Q: File tidak bisa diupload?**
**A:** 
- Pastikan format file `.xlsx`, `.xls`, atau `.csv`
- Pastikan ada kolom "Nama Guru"
- Cek apakah ada data di kolom tersebut

### **Q: Guru tidak muncul setelah upload?**
**A:**
- Refresh halaman (F5)
- Cek apakah ada notifikasi error
- Pastikan koneksi internet stabil

### **Q: Bisa upload berapa guru maksimal?**
**A:**
- Tidak ada batasan
- Bisa ratusan guru sekaligus
- Tapi disarankan per 100 guru untuk performa optimal

### **Q: Bagaimana jika ada nama duplikat?**
**A:**
- Sistem akan tetap insert semua
- Nanti bisa hapus yang duplikat secara manual

---

## 📁 **File Terkait:**

- `supabase_schema_teachers.sql` - Database schema
- `src/pages/TeacherManagementPage.tsx` - Halaman manajemen guru
- `PANDUAN_UPLOAD_GURU.md` - Dokumentasi ini

---

## 🎯 **Workflow Lengkap:**

```
1. Download template Excel
   ↓
2. Isi daftar nama guru (bisa puluhan/ratusan)
   ↓
3. Upload file Excel
   ↓
4. Guru otomatis masuk ke sistem
   ↓
5. Buat jadwal supervisi (pilih dari dropdown)
   ↓
6. Lakukan supervisi
   ↓
7. Isi form supervisi 46 indikator
   ↓
8. Simpan dan generate laporan
```

---

## 🎉 **Selamat!**

Sekarang Anda bisa mengelola ratusan guru dengan mudah!

**Menu:** Supervisi Tahfidz → **Daftar Guru**

**URL:** https://giat-lapor-9mhjmx3ad-azaseras-projects.vercel.app/teachers

---

**Version:** 1.0  
**Date:** 24 November 2025  
**Status:** ✅ Ready to Use
