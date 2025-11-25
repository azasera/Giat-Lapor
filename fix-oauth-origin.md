# Cara Memperbaiki Error OAuth Google "Not a valid origin"

## Masalah
Error `idpiframe_initialization_failed` dengan pesan "Not a valid origin for the client" terjadi karena origin `http://localhost` tidak terdaftar di Google Cloud Console.

## Solusi

### 1. Buka Google Cloud Console
- Kunjungi: https://console.cloud.google.com/
- Pilih project "laporan-kepsek"

### 2. Navigasi ke OAuth Configuration
- Pergi ke **APIs & Services** > **Credentials**
- Klik pada OAuth 2.0 Client ID yang digunakan (190080872114-905qt513bqgn2r9in9fppq0p6dgpd1g2.apps.googleusercontent.com)

### 3. Tambahkan Authorized Origins
Di bagian **Authorized JavaScript origins**, tambahkan:
```
http://localhost:5173
http://localhost:3000
http://127.0.0.1:5173
http://127.0.0.1:3000
```

### 4. Tambahkan Authorized Redirect URIs (jika diperlukan)
Di bagian **Authorized redirect URIs**, tambahkan:
```
http://localhost:5173
http://localhost:3000
http://127.0.0.1:5173
http://127.0.0.1:3000
```

### 5. Simpan Perubahan
- Klik **Save** untuk menyimpan konfigurasi

### 6. Restart Development Server
```bash
npm run dev
```

## Catatan Penting
- Perubahan di Google Cloud Console mungkin memerlukan waktu beberapa menit untuk diterapkan
- Pastikan port yang digunakan sesuai dengan konfigurasi Vite (sekarang menggunakan port 5173)
- Jika masih ada masalah, coba gunakan `http://127.0.0.1:5173` sebagai gantinya

## Troubleshooting
Jika masih ada masalah:
1. Pastikan tidak ada cache browser yang mengganggu
2. Coba buka di incognito/private mode
3. Periksa console browser untuk error lainnya
4. Pastikan API Google Drive dan Sheets sudah diaktifkan di Google Cloud Console
