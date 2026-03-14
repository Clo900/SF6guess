-- Ensure users.id has a default value for custom auth inserts
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Ensure email is nullable (if not already)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Ensure password column exists (already added in previous migration, but good to be safe)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
