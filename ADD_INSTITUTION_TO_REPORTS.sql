-- Add institution column to foundation_tahfidz_reports table
ALTER TABLE foundation_tahfidz_reports 
ADD COLUMN institution VARCHAR(50);

-- Update existing reports to have a default institution (optional, e.g., 'SDITA' or 'GABUNGAN')
-- For now we leave it null or set to 'GABUNGAN' if it was aggregated from all.
-- Let's leave it null for old reports to indicate they might be mixed.

-- Add comment
COMMENT ON COLUMN foundation_tahfidz_reports.institution IS 'Institution name (SDITA, SMPITA, SMAITA, MTA)';
