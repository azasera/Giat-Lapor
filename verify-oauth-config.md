# Verifikasi Konfigurasi OAuth Google

## 🔍 Checklist Konfigurasi OAuth

### 1. Google Cloud Console
Buka: https://console.cloud.google.com/apis/credentials?project=laporan-kepsek

### 2. OAuth 2.0 Client IDs
Cari client dengan ID: `190080872114-gb25knmf1gkrmn5nlsmikkmaifhjptdq`

### 3. Authorized JavaScript origins
Pastikan berisi SEMUA ini:
```
http://localhost:3000
http://localhost:3001
http://localhost:3002
http://localhost:3003
http://127.0.0.1:3000
http://127.0.0.1:3001
http://127.0.0.1:3002
http://127.0.0.1:3003
```

### 4. Authorized redirect URIs
Pastikan berisi SEMUA ini:
```
http://localhost:3000
http://localhost:3001
http://localhost:3002
http://localhost:3003
```

### 5. APIs Enabled
Pastikan APIs ini sudah enabled:
- ✅ Google Drive API
- ✅ Google Sheets API

### 6. API Key
API Key sudah dikonfigurasi: `AIzaSyBgJfQcPy2H6WhbBU6YnCtjFqXWE7UGzNQ`

## ⚠️ Langkah Perbaikan

1. **SAVE** semua perubahan di Google Cloud Console
2. **TUNGGU 5-10 menit** untuk propagasi
3. **REFRESH** browser (clear cache: Ctrl+Shift+R)
4. **TEST** ulang dengan `testGoogleAPI()`

## 🚨 Jika Masih Error

Coba buat OAuth Client ID baru:
1. Create Credentials → OAuth 2.0 Client ID
2. Application type: Web application  
3. Add authorized origins dan redirect URIs
4. Update `googleConfig.ts` dengan client ID baru