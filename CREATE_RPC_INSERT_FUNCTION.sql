-- ============================================
-- CREATE RPC FUNCTION TO BYPASS RLS
-- ============================================

CREATE OR REPLACE FUNCTION insert_annual_schedule(
  p_year text,
  p_institution_name text,
  p_schedule_data jsonb,
  p_created_by uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Run as function owner (bypasses RLS)
AS $$
BEGIN
  INSERT INTO public.tahfidz_annual_schedules (
    year,
    institution_name,
    schedule_data,
    created_by
  )
  VALUES (
    p_year,
    p_institution_name,
    p_schedule_data,
    p_created_by
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION insert_annual_schedule TO authenticated;
GRANT EXECUTE ON FUNCTION insert_annual_schedule TO anon;

-- ============================================
-- SELESAI! Function akan bypass RLS
-- ============================================
