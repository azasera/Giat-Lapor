-- ============================================
-- SAMPLE DATA: Jadwal Tahunan Supervisi
-- ============================================
-- Untuk testing dan demo
-- ============================================

-- CATATAN: Ganti 'USER_ID_HERE' dengan user ID Anda
-- Cara mendapatkan user ID:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- ============================================
-- Contoh 1: Jadwal Mahad Tahfidul Quran 2025
-- ============================================

INSERT INTO public.tahfidz_annual_schedules (
  year, 
  institution_name, 
  schedule_data, 
  created_by
)
VALUES (
  '2025',
  'Mahad Tahfidul Quran',
  '[
    {
      "month": "Januari",
      "teachers": ["Harziki, A.Md.T.", "Alim Aswari"]
    },
    {
      "month": "Februari",
      "teachers": ["Azali Abdul Ghani"]
    },
    {
      "month": "Maret",
      "teachers": ["Alim Aswari", "Muhammad Naufal Hudiya", "Nayatullah, Lc."]
    },
    {
      "month": "April",
      "teachers": ["Harziki, A.Md.T."]
    },
    {
      "month": "Mei",
      "teachers": []
    },
    {
      "month": "Juni",
      "teachers": ["Alim Aswari", "Azali Abdul Ghani"]
    },
    {
      "month": "Juli",
      "teachers": ["Harziki, A.Md.T."]
    },
    {
      "month": "Agustus",
      "teachers": []
    },
    {
      "month": "September",
      "teachers": ["Alim Aswari", "Azali Abdul Ghani", "Muhammad Naufal Hudiya", "Nayatullah, Lc."]
    },
    {
      "month": "Oktober",
      "teachers": ["Harziki, A.Md.T."]
    },
    {
      "month": "November",
      "teachers": []
    },
    {
      "month": "Desember",
      "teachers": ["Alim Aswari", "Azali Abdul Ghani", "Muhammad Naufal Hudiya", "Nayatullah, Lc."]
    }
  ]'::jsonb,
  'USER_ID_HERE' -- GANTI DENGAN USER ID ANDA
);

-- ============================================
-- Contoh 2: Jadwal Merata (Auto Distribusi)
-- ============================================

INSERT INTO public.tahfidz_annual_schedules (
  year, 
  institution_name, 
  schedule_data, 
  created_by
)
VALUES (
  '2025',
  'Pondok Pesantren Al-Hikmah',
  '[
    {
      "month": "Januari",
      "teachers": ["Ustadz Ahmad", "Ustadz Budi", "Ustadz Candra"]
    },
    {
      "month": "Februari",
      "teachers": ["Ustadz Dedi", "Ustadz Eko", "Ustadz Fajar"]
    },
    {
      "month": "Maret",
      "teachers": ["Ustadz Galih", "Ustadz Hadi", "Ustadz Irfan"]
    },
    {
      "month": "April",
      "teachers": ["Ustadz Ahmad", "Ustadz Budi", "Ustadz Candra"]
    },
    {
      "month": "Mei",
      "teachers": ["Ustadz Dedi", "Ustadz Eko", "Ustadz Fajar"]
    },
    {
      "month": "Juni",
      "teachers": ["Ustadz Galih", "Ustadz Hadi", "Ustadz Irfan"]
    },
    {
      "month": "Juli",
      "teachers": ["Ustadz Ahmad", "Ustadz Budi", "Ustadz Candra"]
    },
    {
      "month": "Agustus",
      "teachers": ["Ustadz Dedi", "Ustadz Eko", "Ustadz Fajar"]
    },
    {
      "month": "September",
      "teachers": ["Ustadz Galih", "Ustadz Hadi", "Ustadz Irfan"]
    },
    {
      "month": "Oktober",
      "teachers": ["Ustadz Ahmad", "Ustadz Budi", "Ustadz Candra"]
    },
    {
      "month": "November",
      "teachers": ["Ustadz Dedi", "Ustadz Eko", "Ustadz Fajar"]
    },
    {
      "month": "Desember",
      "teachers": ["Ustadz Galih", "Ustadz Hadi", "Ustadz Irfan"]
    }
  ]'::jsonb,
  'USER_ID_HERE' -- GANTI DENGAN USER ID ANDA
);

-- ============================================
-- Contoh 3: Jadwal Semester (6 Bulan)
-- ============================================

INSERT INTO public.tahfidz_annual_schedules (
  year, 
  institution_name, 
  schedule_data, 
  created_by
)
VALUES (
  '2025',
  'Madrasah Tahfidz Nurul Iman',
  '[
    {
      "month": "Januari",
      "teachers": ["Ustadzah Aisyah", "Ustadzah Fatimah"]
    },
    {
      "month": "Februari",
      "teachers": ["Ustadzah Khadijah", "Ustadzah Maryam"]
    },
    {
      "month": "Maret",
      "teachers": ["Ustadzah Zainab", "Ustadzah Ruqayyah"]
    },
    {
      "month": "April",
      "teachers": []
    },
    {
      "month": "Mei",
      "teachers": []
    },
    {
      "month": "Juni",
      "teachers": []
    },
    {
      "month": "Juli",
      "teachers": ["Ustadzah Aisyah", "Ustadzah Fatimah"]
    },
    {
      "month": "Agustus",
      "teachers": ["Ustadzah Khadijah", "Ustadzah Maryam"]
    },
    {
      "month": "September",
      "teachers": ["Ustadzah Zainab", "Ustadzah Ruqayyah"]
    },
    {
      "month": "Oktober",
      "teachers": []
    },
    {
      "month": "November",
      "teachers": []
    },
    {
      "month": "Desember",
      "teachers": []
    }
  ]'::jsonb,
  'USER_ID_HERE' -- GANTI DENGAN USER ID ANDA
);

-- ============================================
-- Query untuk Verifikasi
-- ============================================

-- Lihat semua jadwal yang sudah dibuat
SELECT 
  id,
  year,
  institution_name,
  created_at,
  jsonb_array_length(schedule_data) as total_months
FROM public.tahfidz_annual_schedules
ORDER BY created_at DESC;

-- Lihat detail jadwal tertentu
SELECT 
  institution_name,
  year,
  jsonb_pretty(schedule_data) as schedule_detail
FROM public.tahfidz_annual_schedules
WHERE institution_name = 'Mahad Tahfidul Quran';

-- Hitung total guru per bulan
SELECT 
  institution_name,
  year,
  month_data->>'month' as month,
  jsonb_array_length(month_data->'teachers') as total_teachers
FROM public.tahfidz_annual_schedules,
     jsonb_array_elements(schedule_data) as month_data
WHERE institution_name = 'Mahad Tahfidul Quran'
ORDER BY 
  CASE month_data->>'month'
    WHEN 'Januari' THEN 1
    WHEN 'Februari' THEN 2
    WHEN 'Maret' THEN 3
    WHEN 'April' THEN 4
    WHEN 'Mei' THEN 5
    WHEN 'Juni' THEN 6
    WHEN 'Juli' THEN 7
    WHEN 'Agustus' THEN 8
    WHEN 'September' THEN 9
    WHEN 'Oktober' THEN 10
    WHEN 'November' THEN 11
    WHEN 'Desember' THEN 12
  END;

-- ============================================
-- Query untuk Hapus Sample Data (jika perlu)
-- ============================================

-- Hapus semua sample data
-- DELETE FROM public.tahfidz_annual_schedules 
-- WHERE institution_name IN (
--   'Mahad Tahfidul Quran',
--   'Pondok Pesantren Al-Hikmah',
--   'Madrasah Tahfidz Nurul Iman'
-- );

-- ============================================
-- Tips Penggunaan
-- ============================================

/*
1. Cara mendapatkan user ID:
   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

2. Ganti 'USER_ID_HERE' dengan user ID yang didapat

3. Jalankan INSERT statement

4. Verifikasi dengan query SELECT

5. Buka aplikasi dan lihat di "Jadwal Tersimpan"

6. Klik icon pensil untuk load dan edit

7. Selamat mencoba!
*/
