-- Migration 060: Create email_sync_logs table to track email lead sync successes and failures
CREATE TABLE IF NOT EXISTS email_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  sender TEXT,
  subject TEXT,
  extracted_name TEXT,
  extracted_phone TEXT,
  extracted_email TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'ignored')),
  error_message TEXT,
  body_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE email_sync_logs ENABLE ROW LEVEL SECURITY;

-- Policies using the standard is_account_member helper
DROP POLICY IF EXISTS email_sync_logs_select ON email_sync_logs;
DROP POLICY IF EXISTS email_sync_logs_insert ON email_sync_logs;
DROP POLICY IF EXISTS email_sync_logs_delete ON email_sync_logs;

CREATE POLICY email_sync_logs_select ON email_sync_logs FOR SELECT USING (is_account_member(account_id));
CREATE POLICY email_sync_logs_insert ON email_sync_logs FOR INSERT WITH CHECK (is_account_member(account_id, 'admin'));
CREATE POLICY email_sync_logs_delete ON email_sync_logs FOR DELETE USING (is_account_member(account_id, 'admin'));

-- Index on account_id and created_at for fast retrieval in the UI settings panel log viewer
CREATE INDEX IF NOT EXISTS idx_email_sync_logs_account_created ON email_sync_logs(account_id, created_at DESC);
