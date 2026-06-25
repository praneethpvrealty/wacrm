-- Migration: 063_create_property_document_requests.sql
-- Creates property_document_requests table for gated document access flow

CREATE TABLE IF NOT EXISTS property_document_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  account_id      uuid NOT NULL,
  requester_name  text NOT NULL,
  requester_phone text NOT NULL,
  requester_email text,
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  -- Secure one-time share token set when approved
  share_token     text UNIQUE,
  -- Token expiry (48h from approval)
  share_token_expires_at timestamptz,
  -- When was the share link last sent via WhatsApp
  share_sent_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by property and status
CREATE INDEX IF NOT EXISTS idx_doc_requests_property
  ON property_document_requests (property_id, status);

CREATE INDEX IF NOT EXISTS idx_doc_requests_account
  ON property_document_requests (account_id, status);

-- Index for token lookup (docs page)
CREATE INDEX IF NOT EXISTS idx_doc_requests_share_token
  ON property_document_requests (share_token);

-- updated_at auto-update trigger
CREATE OR REPLACE FUNCTION update_doc_request_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_doc_request_updated_at ON property_document_requests;
CREATE TRIGGER trg_doc_request_updated_at
  BEFORE UPDATE ON property_document_requests
  FOR EACH ROW EXECUTE FUNCTION update_doc_request_updated_at();

-- RLS
ALTER TABLE property_document_requests ENABLE ROW LEVEL SECURITY;

-- Agents/admins can read requests for their account
CREATE POLICY "Authenticated users can read their account doc requests"
  ON property_document_requests FOR SELECT
  TO authenticated
  USING (
    account_id IN (
      SELECT p.account_id FROM profiles p WHERE p.user_id = auth.uid()
    )
  );

-- Agents/admins can update (approve/reject) requests for their account
CREATE POLICY "Authenticated users can update their account doc requests"
  ON property_document_requests FOR UPDATE
  TO authenticated
  USING (
    account_id IN (
      SELECT p.account_id FROM profiles p WHERE p.user_id = auth.uid()
    )
  );

-- Public (anonymous) can insert new requests — no auth required
CREATE POLICY "Public can insert document requests"
  ON property_document_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
