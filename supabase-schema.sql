-- Create test_accounts table
CREATE TABLE IF NOT EXISTS test_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  oauth_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE test_accounts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows public read access to active test accounts
CREATE POLICY "Public read access to active test accounts" ON test_accounts
  FOR SELECT
  USING (is_active = true);

-- Insert some sample test accounts (replace with your actual test accounts)
INSERT INTO test_accounts (email, oauth_token, is_active) VALUES
  ('test1@yahoo.com', 'your_test_token_1', true),
  ('test2@yahoo.com', 'your_test_token_2', true),
  ('test3@yahoo.com', 'your_test_token_3', true);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_test_accounts_email ON test_accounts(email);

-- Create an index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_test_accounts_is_active ON test_accounts(is_active);

-- Create agent_sessions table for Mastra agent conversation tracking
CREATE TABLE IF NOT EXISTS agent_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_guid TEXT NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_guid ON agent_sessions(user_guid);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_lookup ON agent_sessions(user_guid, session_id);
