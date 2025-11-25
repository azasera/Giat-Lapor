# Debug Steps untuk Masalah Data Muncul Kembali

## ⚠️ ERROR YANG DITEMUKAN:
```
WARNING: Report b2747084-df62-460c-a6a4-44779b7b559d still exists after deletion!
Error: Report deletion failed - record still exists
```

## 🛠️ SOLUSI BERTAHAP:

### LANGKAH 1: Jalankan Script RLS Fix
Jalankan script ini di **Supabase SQL Editor**:
```sql
-- Dari file: fix-rls-policies.sql
DROP POLICY IF EXISTS "Users can update their own reports." ON public.reports;
DROP POLICY IF EXISTS "Users can delete their own reports." ON public.reports;

CREATE POLICY "Users can update their own reports."
  ON public.reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports."
  ON public.reports FOR DELETE
  USING (auth.uid() = user_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
```

### LANGKAH 2: Jika masih gagal, jalankan Emergency Fix
Jalankan script ini di **Supabase SQL Editor**:
```sql
-- Dari file: emergency-fix-delete.sql
CREATE OR REPLACE FUNCTION delete_user_report(report_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id uuid := auth.uid();
    report_owner uuid;
BEGIN
    SELECT user_id INTO report_owner
    FROM public.reports
    WHERE id = report_id;

    IF report_owner != current_user_id THEN
        RAISE EXCEPTION 'Unauthorized: You can only delete your own reports';
    END IF;

    DELETE FROM public.activities WHERE report_id = delete_user_report.report_id;
    DELETE FROM public.achievements WHERE report_id = delete_user_report.report_id;
    DELETE FROM public.reports WHERE id = delete_user_report.report_id;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_user_report(uuid) TO authenticated;
```

## 🔍 DEBUG CONSOLE LOGS:

### Yang harus dicari di console logs saat penghapusan:
```
=== STARTING DELETION PROCESS FOR REPORT [ID] ===
Current authenticated user: [USER_ID]
Report details: {id: [ID], user_id: [USER_ID], current_user: [USER_ID], can_delete: true}
Deleting activities for report [ID]
Deleted X activities
Deleting achievements for report [ID]
Deleted X achievements
Deleting report [ID]
Report deletion successful via direct query: [object]
=== DELETION VERIFIED: Report [ID] no longer exists in database ===
```

### Jika RLS bermasalah, akan muncul:
```
Error deleting report via direct query: [error message]
Attempting to use stored function as fallback...
Report deleted successfully via stored function
```

## 🔧 TROUBLESHOOTING STEPS:

1. **Buka Developer Tools (F12) → Console tab**
2. **Hard refresh** (Ctrl+Shift+R)
3. **Coba hapus laporan** - perhatikan logs
4. **Cek authentication details** dalam logs
5. **Verifikasi user_id match** antara current user dan report owner

## ❌ JIKA MASIH GAGAL:

1. **Temporary disable RLS** (hanya untuk testing):
   ```sql
   ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;
   ```

2. **Manual delete via SQL Editor**:
   ```sql
   DELETE FROM public.activities WHERE report_id = 'REPORT_ID';
   DELETE FROM public.achievements WHERE report_id = 'REPORT_ID';
   DELETE FROM public.reports WHERE id = 'REPORT_ID';
   ```

3. **Re-enable RLS setelah testing**:
   ```sql
   ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
   ```