-- Modify users table to support custom auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);

-- Disable RLS on users and predictions for simple custom auth (since we are not using Supabase Auth tokens)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE predictions DISABLE ROW LEVEL SECURITY;

-- If we want to keep RLS, we would need a way to pass the user ID securely, 
-- but for this simple requirement, we will handle logic in the application.
