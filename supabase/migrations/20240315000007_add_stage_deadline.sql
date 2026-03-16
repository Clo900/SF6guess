
-- Add deadline column to stages table for locking predictions
ALTER TABLE stages ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;
