-- Drop the trigger that syncs auth.users to public.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function used by the trigger
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop the email index
DROP INDEX IF EXISTS idx_users_email;

-- Drop the email column from users table
ALTER TABLE users DROP COLUMN IF EXISTS email;
