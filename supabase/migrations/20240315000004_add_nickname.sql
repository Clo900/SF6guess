-- Add nickname column to users table
ALTER TABLE public.users 
ADD COLUMN nickname TEXT;

-- Update existing users to have nickname same as username (optional, but good for consistency)
UPDATE public.users 
SET nickname = username 
WHERE nickname IS NULL;

-- Make nickname NOT NULL after backfilling (optional, if we want to enforce it)
-- ALTER TABLE public.users ALTER COLUMN nickname SET NOT NULL;
