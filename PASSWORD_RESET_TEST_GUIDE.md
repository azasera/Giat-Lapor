# Panduan Test Password Reset - FIXED

## ✅ Perbaikan yang Dilakukan:

1. **Route Baru**: Ditambahkan `/reset-password` route khusus
2. **URL Redirect**: Email sekarang redirect ke `/reset-password` bukan hash URL
3. **Session Handling**: Perbaikan deteksi recovery session
4. **Error Handling**: Pesan error yang lebih jelas

---

## 🔧 Cara Test Password Reset:

### Step 1: Akses Aplikasi
```
http://localhost:3000/
```

### Step 2: Klik "Lupa Password?"
- Di halaman login, klik tombol "Lupa Password?"

### Step 3: Masukkan Email
- Masukkan email yang terdaftar
- Klik "Kirim Link Reset Password"

### Step 4: Cek Email
- Buka email Anda
- Cari email dari aplikasi
- Klik link yang ada di email

### Step 5: Reset Password
- Link akan membuka halaman `/reset-password`
- Masukkan password baru (minimal 6 karakter)
- Konfirmasi password
- Klik "Atur Ulang Password"

---

## 🧪 Test Manual:

### Test 1: Direct Access
```
http://localhost:3000/reset-password
```
**Expected**: Halaman reset password dengan pesan "Memuat Sesi Recovery..."

### Test 2: With Hash (Old Format)
```
http://localhost:3000/#type=recovery
```
**Expected**: Halaman reset password muncul

### Test 3: Console Debugging
1. Buka Developer Tools (F12)
2. Akses halaman reset
3. Lihat console log untuk:
   - "Recovery session found" atau "No recovery session found"
   - Error messages jika ada

---

## 🔍 Troubleshooting:

### Jika Link Email Tidak Bekerja:
1. Pastikan email berisi link ke `/reset-password`
2. Cek folder spam
3. Request reset password baru

### Jika Halaman Menunjukkan Error:
1. Cek browser console (F12)
2. Pastikan development server berjalan
3. Clear browser cache

### Jika Session Tidak Valid:
1. Request reset password baru
2. Jangan tunggu terlalu lama (token expire)
3. Gunakan link langsung dari email

---

## 📧 Format Email Link Baru:
```
http://localhost:3000/reset-password?token=...
```

## 🎯 Expected Flow:
1. User request reset → Email sent
2. User click email link → Redirect to `/reset-password`
3. App detects recovery session → Show reset form
4. User enter new password → Password updated
5. Auto logout → Redirect to login

---

## ⚠️ Catatan Penting:
- Link reset password hanya valid untuk waktu terbatas
- Setelah reset berhasil, user harus login ulang
- Jika ada masalah, request reset password baru