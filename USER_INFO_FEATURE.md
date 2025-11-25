# 👤 Fitur Info User yang Sedang Login

## ✨ Fitur yang Ditambahkan

### **1. User Info di Header (Desktop)**
Tampil di pojok kanan atas, menampilkan:
- 👤 Icon user
- 📝 Nama lengkap user
- 🏷️ Role (Kepala Sekolah / Yayasan / Administrator)

**Lokasi:** Header kanan, sebelah tombol dark mode

**Responsive:** 
- ✅ Tampil di layar **medium ke atas** (md:flex)
- ❌ Hidden di layar mobile (untuk hemat space)

---

### **2. User Info di Sidebar (Expanded)**
Tampil di bagian atas sidebar saat terbuka, menampilkan:
- 👤 Avatar icon (lingkaran hijau)
- 📝 Nama lengkap
- 📧 Email
- 🏷️ Badge role dengan warna

**Lokasi:** Sidebar atas, sebelum menu navigasi

**Tampilan:**
```
┌─────────────────────────┐
│  👤  Nama User          │
│      email@example.com  │
│      [Kepala Sekolah]   │
├─────────────────────────┤
│  📊 Dashboard           │
│  📝 Buat Laporan        │
│  ...                    │
```

---

### **3. User Icon di Sidebar (Collapsed)**
Tampil saat sidebar di-minimize, menampilkan:
- 👤 Icon user saja (lingkaran hijau)

**Lokasi:** Sidebar atas, centered

---

## 🎨 Desain

### **Warna Badge Role:**
- **Kepala Sekolah** (Principal): 🟢 Hijau emerald
- **Yayasan** (Foundation): 🟢 Hijau emerald
- **Administrator** (Admin): 🟢 Hijau emerald

### **Dark Mode Support:**
- ✅ Otomatis menyesuaikan warna
- ✅ Background, text, dan border berubah
- ✅ Tetap readable di mode gelap

---

## 📊 Data yang Ditampilkan

### **Sumber Data:**
```typescript
userProfile: {
  username: string;    // Username dari profiles
  full_name: string;   // Nama lengkap dari profiles
  email: string;       // Email dari auth.users
}

userRole: 'principal' | 'foundation' | 'admin'
```

### **Fallback:**
Jika data tidak lengkap:
- `username` → Email prefix (sebelum @)
- `full_name` → Email
- `email` → Empty string

---

## 🔄 Update Data

Data user di-fetch saat:
1. ✅ **Login** pertama kali
2. ✅ **Refresh** halaman
3. ✅ **Session** berubah

Data **tidak** auto-update saat:
- ❌ User mengubah profile di database
- ❌ Role diubah oleh admin

**Solusi:** User harus **logout & login lagi** untuk melihat perubahan.

---

## 💡 Cara Kerja

### **1. Fetch User Profile:**
```typescript
// Di loadInitialData()
let profile = await fetchUserProfile(session.user.id);

if (profile) {
  setUserRole(profile.role);
  setUserProfile({
    username: profile.username || session.user.email?.split('@')[0],
    full_name: profile.full_name || session.user.email,
    email: session.user.email
  });
}
```

### **2. Display di Header:**
```tsx
{userProfile && (
  <div className="hidden md:flex items-center space-x-2">
    <UserCircle className="w-5 h-5" />
    <div>
      <span>{userProfile.full_name}</span>
      <span>{userRole === 'principal' ? 'Kepala Sekolah' : ...}</span>
    </div>
  </div>
)}
```

### **3. Display di Sidebar:**
```tsx
{userProfile && isSidebarOpen && (
  <div className="px-4 pb-4 mb-4 border-b">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-emerald-100 rounded-full">
        <UserCircle />
      </div>
      <div>
        <p>{userProfile.full_name}</p>
        <p>{userProfile.email}</p>
        <span className="badge">{role}</span>
      </div>
    </div>
  </div>
)}
```

---

## 🎯 Responsive Behavior

| Screen Size | Header Info | Sidebar Info (Expanded) | Sidebar Icon (Collapsed) |
|-------------|-------------|-------------------------|--------------------------|
| Mobile (< 768px) | ❌ Hidden | ✅ Visible | ✅ Visible |
| Tablet (768px+) | ✅ Visible | ✅ Visible | ✅ Visible |
| Desktop (1024px+) | ✅ Visible | ✅ Visible | ✅ Visible |

---

## 🔧 Customization

### **Ubah Label Role:**
Edit di `IslamicPrincipalReportApp.tsx`:
```typescript
{userRole === 'principal' ? 'Kepala Sekolah' : 
 userRole === 'foundation' ? 'Yayasan' : 
 'Administrator'}
```

### **Ubah Warna Badge:**
Edit class di sidebar user info:
```tsx
<span className="bg-emerald-100 text-emerald-700">
  {/* Ganti emerald dengan warna lain: blue, purple, etc */}
</span>
```

### **Tambah Avatar Image:**
Ganti `UserCircle` icon dengan `<img>`:
```tsx
<img 
  src={userProfile.avatar_url || '/default-avatar.png'} 
  alt="Avatar"
  className="w-10 h-10 rounded-full"
/>
```

---

## 🐛 Troubleshooting

### **Problem: User info tidak muncul**
**Solusi:**
1. Cek apakah user sudah login
2. Cek console untuk error
3. Pastikan `fetchUserProfile` berhasil
4. Logout & login lagi

### **Problem: Nama tidak sesuai**
**Solusi:**
1. Cek data di tabel `profiles`
2. Update `full_name` di database
3. Logout & login lagi

### **Problem: Role tidak sesuai**
**Solusi:**
1. Cek `role` di tabel `profiles`
2. Pastikan huruf kecil semua: `principal`, `foundation`, `admin`
3. Logout & login lagi

---

## 📝 Database Schema

User info diambil dari 2 tabel:

### **1. auth.users (Supabase Auth)**
```sql
- id (uuid)
- email (text)
- created_at (timestamp)
```

### **2. public.profiles**
```sql
- id (uuid) → references auth.users
- username (text)
- full_name (text)
- role (text)
- avatar_url (text)
```

---

## ✅ Testing

### **Test 1: Login sebagai Principal**
1. Login dengan akun principal
2. Cek header → Nama & "Kepala Sekolah" muncul
3. Cek sidebar → Info lengkap muncul

### **Test 2: Login sebagai Foundation**
1. Login dengan akun foundation
2. Cek header → Nama & "Yayasan" muncul
3. Cek sidebar → Info lengkap muncul

### **Test 3: Login sebagai Admin**
1. Login dengan akun admin
2. Cek header → Nama & "Administrator" muncul
3. Cek sidebar → Info lengkap muncul

### **Test 4: Responsive**
1. Buka di mobile → Header info hidden, sidebar info visible
2. Buka di desktop → Semua visible
3. Toggle sidebar → Icon/info berubah sesuai state

---

## 🎉 Kesimpulan

Fitur user info sudah terintegrasi dengan baik:
- ✅ Tampil di header (desktop)
- ✅ Tampil di sidebar (expanded)
- ✅ Icon di sidebar (collapsed)
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Role-based display

User sekarang bisa melihat info mereka dengan jelas! 👤
