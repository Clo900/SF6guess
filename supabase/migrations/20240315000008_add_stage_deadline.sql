ALTER TABLE stages 
ADD COLUMN deadline timestamptz,
ADD COLUMN is_locked boolean DEFAULT false;

-- Update existing stages with a default deadline (e.g., 2026-03-17) or leave null
UPDATE stages SET deadline = '2026-03-17 00:00:00+08' WHERE deadline IS NULL;
