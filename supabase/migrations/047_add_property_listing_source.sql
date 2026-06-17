-- ============================================================
-- 047_add_property_listing_source.sql
-- Adds listing_source column to properties table to identify
-- whether a property is direct from the owner or referred by an agent.
-- ============================================================

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS listing_source TEXT NOT NULL DEFAULT 'owner'
  CHECK (listing_source IN ('owner', 'agent'));

-- Create index to optimize filtering by source
CREATE INDEX IF NOT EXISTS idx_properties_listing_source ON properties(listing_source);
