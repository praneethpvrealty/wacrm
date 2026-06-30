-- 075_broadcast_retry_queue.sql
-- Adds retry tracking to broadcast_recipients so rate-limited sends
-- can be re-dispatched with exponential backoff instead of being
-- permanently marked as failed.
--
-- New columns:
--   retry_count  — number of send attempts made so far
--   retry_after  — earliest timestamp at which a retry is allowed
--   whatsapp_message_id — stored on the recipient row (denormalised from
--                          messages table) for faster broadcast detail queries
--
-- The status CHECK is expanded to allow 'rate_limited':
--   pending       → not yet attempted
--   sent          → delivered to Meta (may still be in-flight to user)
--   rate_limited  → Meta returned 130429; will be retried after retry_after
--   failed        → permanent failure (not retryable, or retry_count ≥ 3)
--   delivered / read / replied → updated by webhook

ALTER TABLE broadcast_recipients
  ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS retry_after TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT;

-- Expand the status CHECK to include 'rate_limited'.
-- PostgreSQL doesn't support ALTER CONSTRAINT — drop and recreate.
ALTER TABLE broadcast_recipients
  DROP CONSTRAINT IF EXISTS broadcast_recipients_status_check;

ALTER TABLE broadcast_recipients
  ADD CONSTRAINT broadcast_recipients_status_check
  CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'replied', 'failed', 'rate_limited'));

-- Index for the retry-worker query: find retryable rows for a broadcast
-- efficiently without a full scan.
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_retry
  ON broadcast_recipients (broadcast_id, status, retry_after)
  WHERE status IN ('failed', 'rate_limited');

-- Partial index for pending rows (used by broadcast send loop to resume).
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_pending
  ON broadcast_recipients (broadcast_id, created_at)
  WHERE status = 'pending';
