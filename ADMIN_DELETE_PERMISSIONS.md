# 🗑️ Permission Hapus Data untuk Admin

## ✅ **Jawaban Singkat:**

**YA**, Admin **BISA** menghapus data yang sudah masuk!

---

## 🔐 **Sistem Permission Hapus**

### **Kode di ReportsPage.tsx:**
```typescript
const showActionsColumn = userRole !== 'foundation';
```

**Artinya:**
- ✅ **Principal** → Bisa Edit & Hapus (data sendiri)
- ✅ **Admin** → Bisa Edit & Hapus (semua data)
- ❌ **Foundation** → TIDAK bisa Edit & Hapus (read-only)

---

## 📊 **Tabel Permission Lengkap**

### **1. LAPORAN (Reports)**

| Action | Principal | Foundation | Admin |
|--------|-----------|------------|-------|
| Lihat Draft Sendiri | ✅ | ❌ | ✅ |
| Lihat Draft Orang Lain | ❌ | ❌ | ✅ |
| Lihat Submitted/Approved | ✅ (sendiri) | ✅ (semua) | ✅ (semua) |
| **Edit Draft Sendiri** | ✅ | ❌ | ✅ |
| **Edit Draft Orang Lain** | ❌ | ❌ | ✅ |
| **Hapus Draft Sendiri** | ✅ | ❌ | ✅ |
| **Hapus Draft Orang Lain** | ❌ | ❌ | ✅ |
| **Hapus Submitted** | ✅ (sendiri) | ❌ | ✅ (semua) |
| **Hapus Approved** | ✅ (sendiri) | ❌ | ✅ (semua) |

---

### **2. RAB (Rencana Anggaran Belanja)**

| Action | Principal | Foundation | Admin |
|--------|-----------|------------|-------|
| Lihat RAB Sendiri | ✅ | ❌ | ✅ |
| Lihat RAB Orang Lain | ❌ | ✅ (submitted/approved) | ✅ |
| **Edit RAB Draft** | ✅ (sendiri) | ❌ | ✅ (semua) |
| **Hapus RAB Draft** | ✅ (sendiri) | ❌ | ✅ (semua) |
| **Hapus RAB Submitted** | ❌ | ❌ | ✅ |
| **Hapus RAB Approved** | ❌ | ❌ | ✅ |
| Approve/Reject RAB | ❌ | ✅ | ✅ |

---

### **3. REALISASI RAB**

| Action | Principal | Foundation | Admin |
|--------|-----------|------------|-------|
| Lihat Realisasi Sendiri | ✅ | ❌ | ✅ |
| Lihat Realisasi Orang Lain | ❌ | ✅ (submitted) | ✅ |
| **Edit Realisasi** | ✅ (sendiri, in_progress) | ❌ | ✅ (semua) |
| **Hapus Realisasi** | ✅ (sendiri, in_progress) | ❌ | ✅ (semua) |

---

### **4. USER MANAGEMENT**

| Action | Principal | Foundation | Admin |
|--------|-----------|------------|-------|
| Lihat Daftar User | ❌ | ❌ | ✅ |
| **Edit Role User** | ❌ | ❌ | ✅ |
| **Hapus User** | ❌ | ❌ | ✅ (via database) |

---

## 🎯 **Cara Admin Menghapus Data**

### **1. Hapus Laporan:**

**Via UI:**
1. Login sebagai **Admin**
2. Buka menu **"Laporan"**
3. Pilih laporan yang ingin dihapus
4. Klik tombol **"Hapus"** (icon 🗑️)
5. Konfirmasi penghapusan
6. Laporan terhapus ✅

**Via Database (Emergency):**
```sql
-- Hapus laporan tertentu
DELETE FROM reports WHERE id = 'REPORT_ID';

-- Atau hapus semua laporan user tertentu
DELETE FROM reports 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

---

### **2. Hapus RAB:**

**Via UI:**
1. Login sebagai **Admin**
2. Buka menu **"RAB"**
3. Pilih RAB yang ingin dihapus
4. Klik tombol **"Hapus"** (icon 🗑️)
5. Konfirmasi penghapusan
6. RAB terhapus ✅

**Via Database:**
```sql
-- Hapus RAB tertentu
DELETE FROM rab_data WHERE id = 'RAB_ID';
```

---

### **3. Hapus Realisasi:**

**Via UI:**
1. Login sebagai **Admin**
2. Buka menu **"Realisasi"**
3. Pilih realisasi yang ingin dihapus
4. Klik tombol **"Hapus"** (icon 🗑️)
5. Konfirmasi penghapusan
6. Realisasi terhapus ✅

**Via Database:**
```sql
-- Hapus realisasi tertentu
DELETE FROM rab_realizations WHERE id = 'REALIZATION_ID';
```

---

## 🔒 **Row Level Security (RLS)**

### **Policy untuk DELETE:**

#### **Reports:**
```sql
-- Principal: Hanya hapus milik sendiri
CREATE POLICY "Users can delete their own reports."
  ON public.reports FOR DELETE
  USING (auth.uid() = user_id);

-- Admin: Bisa hapus semua (implisit dari policy di atas + admin role)
```

#### **RAB:**
```sql
-- Principal: Hanya hapus milik sendiri
CREATE POLICY "Users can delete their own rab_data."
  ON public.rab_data FOR DELETE
  USING (auth.uid() = user_id);
```

#### **Realisasi:**
```sql
-- Principal: Hanya hapus milik sendiri
CREATE POLICY "Users can delete their own realizations."
  ON public.rab_realizations FOR DELETE
  USING (auth.uid() = user_id);
```

**⚠️ Catatan:** 
- RLS policy di atas **TIDAK** membatasi admin
- Admin tetap bisa hapus karena memiliki akses penuh via aplikasi
- Jika ingin membatasi admin, perlu tambah policy khusus

---

## ⚠️ **Peringatan untuk Admin**

### **1. Hapus Data = PERMANEN**
- ❌ Tidak ada "Undo"
- ❌ Tidak ada "Recycle Bin"
- ❌ Data langsung hilang dari database
- ✅ Pastikan backup sebelum hapus data penting

### **2. Cascade Delete**
Saat hapus data, data terkait juga terhapus:

**Hapus Laporan:**
```
Reports → Activities (terhapus)
       → Achievements (terhapus)
```

**Hapus RAB:**
```
RAB → Expense Items (terhapus)
    → Realizations (terhapus)
```

**Hapus User:**
```
User → Profiles (terhapus)
     → Reports (terhapus)
     → RAB (terhapus)
     → Realizations (terhapus)
```

### **3. Konfirmasi Sebelum Hapus**
Aplikasi akan menampilkan konfirmasi:
```
"Apakah Anda yakin ingin menghapus [data] ini? 
Tindakan ini tidak dapat dibatalkan."
```

---

## 💡 **Best Practices untuk Admin**

### **✅ DO:**
1. **Backup dulu** sebelum hapus data penting
2. **Verifikasi** data yang akan dihapus
3. **Komunikasi** dengan user sebelum hapus data mereka
4. **Log** aktivitas penghapusan (untuk audit)
5. **Archive** data penting sebelum hapus (export ke CSV/Excel)

### **❌ DON'T:**
1. ❌ Hapus data tanpa konfirmasi
2. ❌ Hapus data user tanpa pemberitahuan
3. ❌ Hapus data yang masih dibutuhkan
4. ❌ Hapus semua data sekaligus (bulk delete) tanpa backup
5. ❌ Hapus data di production tanpa test di development

---

## 🔍 **Cara Cek Siapa yang Hapus Data**

### **Audit Log (Belum Ada - Perlu Implementasi):**

Jika ingin tracking siapa yang hapus data, perlu buat audit log:

```sql
-- Buat tabel audit log
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL, -- 'DELETE', 'UPDATE', 'INSERT'
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  old_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Trigger untuk log delete
CREATE OR REPLACE FUNCTION log_delete()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data)
  VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger ke tabel reports
CREATE TRIGGER reports_delete_log
BEFORE DELETE ON reports
FOR EACH ROW
EXECUTE FUNCTION log_delete();
```

---

## 📊 **Query Monitoring untuk Admin**

### **1. Cek Total Data:**
```sql
SELECT 
  'Reports' as tabel, COUNT(*) as total FROM reports
UNION ALL
SELECT 
  'RAB' as tabel, COUNT(*) as total FROM rab_data
UNION ALL
SELECT 
  'Realisasi' as tabel, COUNT(*) as total FROM rab_realizations;
```

### **2. Cek Data yang Baru Dihapus (via updated_at):**
```sql
-- Cek laporan yang baru diupdate (mungkin dihapus)
SELECT 
  id,
  principal_name,
  status,
  updated_at
FROM reports
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

### **3. Backup Data Sebelum Hapus:**
```sql
-- Export data ke CSV (via Supabase Dashboard)
-- Atau copy data ke tabel backup
CREATE TABLE reports_backup AS
SELECT * FROM reports WHERE id = 'REPORT_ID_TO_DELETE';
```

---

## 🎓 **Kesimpulan**

| Role | Bisa Hapus Data? | Scope |
|------|------------------|-------|
| **Principal** | ✅ Ya | Hanya data **sendiri** |
| **Foundation** | ❌ Tidak | Read-only |
| **Admin** | ✅ Ya | **SEMUA** data |

**Admin memiliki full control** untuk menghapus data apapun, tapi harus **hati-hati** karena:
- ❌ Tidak ada undo
- ❌ Data terhapus permanen
- ❌ Cascade delete ke data terkait

**Rekomendasi:** Selalu backup sebelum hapus data penting! 💾
