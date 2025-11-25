-- EMERGENCY FIX untuk masalah delete
-- Jalankan hanya jika script utama tidak bekerja

-- OPSI 1: Temporarily disable RLS untuk testing
-- ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.achievements DISABLE ROW LEVEL SECURITY;

-- OPSI 2: Recreate policies dengan approach berbeda
DROP POLICY IF EXISTS "Users can delete their own reports." ON public.reports;

CREATE POLICY "Users can delete their own reports."
  ON public.reports FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- OPSI 3: Manual delete function (jika RLS tidak bisa diperbaiki)
CREATE OR REPLACE FUNCTION delete_user_report(report_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id uuid := auth.uid();
    report_owner uuid;
BEGIN
    -- Check if user owns the report
    SELECT user_id INTO report_owner
    FROM public.reports
    WHERE id = report_id;

    IF report_owner != current_user_id THEN
        RAISE EXCEPTION 'Unauthorized: You can only delete your own reports';
    END IF;

    -- Delete associated activities
    DELETE FROM public.activities WHERE report_id = delete_user_report.report_id;

    -- Delete associated achievements
    DELETE FROM public.achievements WHERE report_id = delete_user_report.report_id;

    -- Delete the report
    DELETE FROM public.reports WHERE id = delete_user_report.report_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_user_report(uuid) TO authenticated;