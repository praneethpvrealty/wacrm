-- 074_contact_duplicate_detection.sql
-- Adds soft-merge support and a merge audit log to the contacts table.
--
-- Design:
--   • contacts.merged_into_id   — points to the "winner" contact after a merge.
--     The loser row is kept (soft-deleted) for audit / FK integrity.
--   • contacts.is_merged        — boolean flag; merged contacts are excluded from
--     normal queries via the default filter.
--   • contact_merge_log         — immutable audit trail of every merge operation.
--
-- Existing ingestion paths already deduplicate by phone; this migration enables
-- the UI-driven merge flow and the /api/contacts/duplicates detection endpoint.

-- ── contacts: add merge columns ──────────────────────────────────────────────

ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS merged_into_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_merged      BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_contacts_merged_into
  ON contacts(merged_into_id) WHERE merged_into_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_is_merged
  ON contacts(account_id, is_merged);

-- ── contact_merge_log ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contact_merge_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  merged_by       UUID NOT NULL REFERENCES auth.users(id),
  source_id       UUID NOT NULL,   -- the contact that was merged away (may be deleted)
  target_id       UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  source_snapshot JSONB,           -- full row of the source contact at merge time
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE contact_merge_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY contact_merge_log_select
  ON contact_merge_log FOR SELECT
  USING (is_account_member(account_id));

-- Only the server-side merge endpoint (service role) may insert.
-- Authenticated users have no INSERT policy — enforced at API layer.

CREATE INDEX IF NOT EXISTS idx_contact_merge_log_account
  ON contact_merge_log(account_id, created_at DESC);
