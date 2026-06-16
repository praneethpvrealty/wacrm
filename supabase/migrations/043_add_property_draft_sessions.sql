-- ============================================================
-- 043_add_property_draft_sessions.sql
-- Creates property_draft_sessions table to track active chatbot 
-- parsing sessions per owner/contact.
-- Also adds phone column to profiles table.
-- ============================================================

-- Add phone column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);


CREATE TABLE IF NOT EXISTS property_draft_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  draft_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'collecting' CHECK (status IN ('collecting', 'awaiting_confirmation')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(contact_id)
);

-- Index for tenancy and lookup scoping
CREATE INDEX IF NOT EXISTS idx_property_draft_sessions_contact ON property_draft_sessions(contact_id);

-- Enable RLS
ALTER TABLE property_draft_sessions ENABLE ROW LEVEL SECURITY;

-- Select policy: any member of the account can read
DROP POLICY IF EXISTS draft_sessions_select ON property_draft_sessions;
CREATE POLICY draft_sessions_select ON property_draft_sessions FOR SELECT USING (
  is_account_member(account_id)
);

-- Modify policy: agent or higher can insert/update/delete
DROP POLICY IF EXISTS draft_sessions_modify ON property_draft_sessions;
CREATE POLICY draft_sessions_modify ON property_draft_sessions FOR ALL USING (
  is_account_member(account_id, 'agent')
) WITH CHECK (
  is_account_member(account_id, 'agent')
);

-- Add update trigger for updated_at column
DROP TRIGGER IF EXISTS set_draft_sessions_updated_at ON property_draft_sessions;
CREATE TRIGGER set_draft_sessions_updated_at BEFORE UPDATE ON property_draft_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
