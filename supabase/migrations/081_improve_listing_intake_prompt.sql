-- ============================================================
-- 081_improve_listing_intake_prompt.sql
-- Replaces the "List My Property" intake prompt with a warmer, more
-- descriptive one on already-cloned "Real Estate Showcase" flows.
--
-- Also fixes a bug from migration 078: its backfill used a plain ''
-- string literal for intro_text, so '\n' was stored as a literal
-- two-character backslash-n instead of a real line break (plain SQL
-- string literals don't interpret escapes — E'' strings do). This
-- migration uses E'' throughout so the prompt actually renders with
-- line breaks on WhatsApp.
-- ============================================================

UPDATE flow_nodes fn
SET config = jsonb_set(
  fn.config,
  '{intro_text}',
  to_jsonb(
    E'📋 *List Your Property*\n\n' ||
    E'Ready to get your property in front of serious buyers? Just share a few details and photos, and we''ll put together a polished listing for you.\n\n' ||
    E'• 📸 *Photos* — any angle, as many as you have\n' ||
    E'• 📝 *Details* — location, price, type, BHK, area, amenities, anything else worth mentioning\n\n' ||
    E'Send it all at once or a bit at a time — we''ll piece it together and show you a preview before it goes live.\n\n' ||
    E'_Type *cancel* anytime to stop._'
  )
)
WHERE fn.node_key = 'seller_handoff'
  AND fn.node_type = 'start_property_intake'
  AND EXISTS (
    SELECT 1 FROM flows f
    WHERE f.id = fn.flow_id
    AND f.name = 'Real Estate Showcase'
  );
