-- Add institution column to teachers table
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS institution VARCHAR(50);

-- Add institution column to tahfidz_supervisions table (for snapshotting)
ALTER TABLE tahfidz_supervisions 
ADD COLUMN IF NOT EXISTS institution VARCHAR(50);

-- Update existing records (optional, set default if needed)
-- UPDATE teachers SET institution = 'SDITA' WHERE institution IS NULL;
