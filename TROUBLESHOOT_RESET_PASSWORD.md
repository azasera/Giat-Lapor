# Troubleshooting Reset Password

## Masalah: Tidak Terhubung ke Halaman Reset Password

### Kemungkinan Penyebab:

1. **Email Link Tidak Valid**
2. **URL Hash Tidak Terbaca**
3. **Browser Cache Issue**
4. **Development Server Issue**

---

## Langkah Troubleshooting:

### 1. Periksa Email Link
**Pastikan link di email benar:**
- Link harus berisi `#type=recovery`
- Link harus berisi `access_token=...`
- Contoh: `http://localhost:3000/#type=recovery&access_token=...`

### 2. Test Manual URL
**Coba akses URL ini di browser:**
```
http://localhost:3000/#type=recovery
```
- Jika muncul halaman reset password → URL routing OK
- Jika tidak muncul → Ada masalah routing

### 3. Check Browser Console
**Buka Developer Tools (F12) → Console:**
- Cari log: "URL hash:", "Recovery type:", "Access token present:"
- Jika tidak ada log → JavaScript error
- Jika ada log → Lihat nilai yang ditampilkan

### 4. Clear Browser Data
**Hapus cache dan data:**
- Chrome: Ctrl+Shift+Delete → Clear all
- Firefox: Ctrl+Shift+Delete → Clear all
- Restart browser setelah clear

### 5. Test di Browser Lain
**Coba browser berbeda:**
- Chrome → Firefox
- Edge → Safari
- Incognito/Private mode

### 6. Restart Development Server
**Restart server jika perlu:**
```bash
# Stop server (Ctrl+C di terminal)
# Lalu jalankan ulang:
npm run dev
```

---

## Debugging Steps:

### Step 1: Test Forgot Password Flow
1. Buka http://localhost:3000/
2. Klik "Lupa Password?"
3. Masukkan email valid
4. Klik "Kirim Link Reset Password"
5. Periksa console untuk error

### Step 2: Check Email Content
1. Buka email reset password
2. Copy link yang ada
3. Paste di notepad untuk melihat struktur
4. Pastikan ada `#type=recovery&access_token=...`

### Step 3: Manual URL Test
1. Buka browser baru
2. Paste URL: `http://localhost:3000/#type=recovery`
3. Lihat apakah muncul form reset password

### Step 4: Console Debugging
1. Buka Developer Tools (F12)
2. Klik tab Console
3. Refresh halaman
4. Lihat log yang muncul

---

## Expected Behavior:

### ✅ Normal Flow:
1. User klik "Lupa Password?"
2. User masukkan email → Submit
3. Email terkirim dengan link recovery
4. User klik link di email
5. Browser redirect ke halaman reset password
6. User masukkan password baru
7. Password berhasil direset

### ❌ Error Indicators:
- Link email tidak mengandung `#type=recovery`
- Console error saat parsing URL
- Halaman tidak redirect ke reset form
- Form reset tidak muncul

---

## Quick Fixes:

### Fix 1: Manual URL
Jika email link bermasalah, coba URL manual:
```
http://localhost:3000/#type=recovery&access_token=PASTE_TOKEN_FROM_EMAIL
```

### Fix 2: Production URL
Jika localhost bermasalah, coba production:
```
https://your-app.vercel.app/#type=recovery&access_token=...
```

### Fix 3: Request New Reset
- Request reset password baru
- Gunakan email yang pasti terdaftar
- Cek folder spam

---

## Contact Admin If:
- Semua troubleshooting gagal
- Email tidak pernah masuk (sudah cek spam)
- Link selalu error
- Browser console menunjukkan error JavaScript

Admin dapat reset password secara manual dari database.