-- ============================================
-- SQL Migration: FIX MEMO RLS WRITE POLICIES
-- ============================================
-- Deskripsi: Kebijakan RLS lengkap untuk membuat (INSERT), mengedit (UPDATE), 
--            dan menghapus (DELETE) memo internal serta detail tabelnya.
-- Jalankan script ini di Supabase SQL Editor jika terjadi error 406 /
-- "Cannot coerce the result to a single JSON object" saat menyimpan memo.

-- Pastikan RLS aktif
ALTER TABLE public.memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memo_tables ENABLE ROW LEVEL SECURITY;


-- ============================================
-- 1. KEBIJAKAN UNTUK TABEL public.memos
-- ============================================

-- 1.1 SELECT: Kebijakan agar Principal bisa melihat memo miliknya sendiri (jika belum ada)
DROP POLICY IF EXISTS "Users can view their own memos" ON public.memos;
CREATE POLICY "Users can view their own memos"
  ON public.memos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 1.2 SELECT: Kebijakan agar Admin bisa melihat semua memo (jika belum ada)
DROP POLICY IF EXISTS "Admin can view all memos" ON public.memos;
CREATE POLICY "Admin can view all memos"
  ON public.memos FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- 1.3 SELECT: Kebijakan agar Foundation bisa melihat memo yang dikirim (jika belum ada)
DROP POLICY IF EXISTS "Foundation can view sent memos" ON public.memos;
CREATE POLICY "Foundation can view sent memos"
  ON public.memos FOR SELECT
  TO authenticated
  USING (
    status = 'sent_to_foundation'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'foundation'
    )
  );

-- 1.4 INSERT: Izinkan pengguna membuat memo dengan user_id mereka sendiri
DROP POLICY IF EXISTS "Users can insert their own memos" ON public.memos;
CREATE POLICY "Users can insert their own memos"
  ON public.memos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 1.5 UPDATE: Izinkan pengguna mengedit memo mereka sendiri
DROP POLICY IF EXISTS "Users can update their own memos" ON public.memos;
CREATE POLICY "Users can update their own memos"
  ON public.memos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 1.6 UPDATE: Izinkan Admin mengedit semua memo (termasuk membubuhi TTD Mudir / Stempel)
DROP POLICY IF EXISTS "Admin can update all memos" ON public.memos;
CREATE POLICY "Admin can update all memos"
  ON public.memos FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 1.7 DELETE: Izinkan pengguna menghapus memo mereka sendiri
DROP POLICY IF EXISTS "Users can delete their own memos" ON public.memos;
CREATE POLICY "Users can delete their own memos"
  ON public.memos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 1.8 DELETE: Izinkan Admin menghapus memo siapa saja
DROP POLICY IF EXISTS "Admin can delete all memos" ON public.memos;
CREATE POLICY "Admin can delete all memos"
  ON public.memos FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));


-- ============================================
-- 2. KEBIJAKAN UNTUK TABEL public.memo_tables
-- ============================================

-- 2.1 SELECT: Izinkan pengguna melihat detail tabel dari memo milik sendiri (jika belum ada)
DROP POLICY IF EXISTS "Users can view their own memo tables" ON public.memo_tables;
CREATE POLICY "Users can view their own memo tables"
  ON public.memo_tables FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.memos
    WHERE public.memos.id = public.memo_tables.memo_id
    AND public.memos.user_id = auth.uid()
  ));

-- 2.2 SELECT: Izinkan Admin melihat semua detail tabel (jika belum ada)
DROP POLICY IF EXISTS "Admin can view all memo tables" ON public.memo_tables;
CREATE POLICY "Admin can view all memo tables"
  ON public.memo_tables FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- 2.3 SELECT: Izinkan Foundation melihat detail tabel dari memo yang dikirim (jika belum ada)
DROP POLICY IF EXISTS "Foundation can view memo tables" ON public.memo_tables;
CREATE POLICY "Foundation can view memo tables"
  ON public.memo_tables FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.memos
    WHERE public.memos.id = public.memo_tables.memo_id
    AND public.memos.status = 'sent_to_foundation'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'foundation'
    )
  ));

-- 2.4 INSERT: Izinkan pembuat memo / Admin memasukkan detail tabel
DROP POLICY IF EXISTS "Users can insert memo tables" ON public.memo_tables;
CREATE POLICY "Users can insert memo tables"
  ON public.memo_tables FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.memos
    WHERE public.memos.id = public.memo_tables.memo_id
    AND (public.memos.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ))
  ));

-- 2.5 UPDATE: Izinkan pembuat memo / Admin memperbarui detail tabel
DROP POLICY IF EXISTS "Users can update memo tables" ON public.memo_tables;
CREATE POLICY "Users can update memo tables"
  ON public.memo_tables FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.memos
    WHERE public.memos.id = public.memo_tables.memo_id
    AND (public.memos.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ))
  ));

-- 2.6 DELETE: Izinkan pembuat memo menghapus detail tabel memo mereka sendiri
DROP POLICY IF EXISTS "Users can delete their own memo tables" ON public.memo_tables;
CREATE POLICY "Users can delete their own memo tables"
  ON public.memo_tables FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.memos
    WHERE public.memos.id = public.memo_tables.memo_id
    AND public.memos.user_id = auth.uid()
  ));

-- 2.7 DELETE: Izinkan Admin menghapus detail tabel memo mana saja
DROP POLICY IF EXISTS "Admin can delete all memo tables" ON public.memo_tables;
CREATE POLICY "Admin can delete all memo tables"
  ON public.memo_tables FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));
