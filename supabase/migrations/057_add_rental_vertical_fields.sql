-- ============================================================
-- 057_add_rental_vertical_fields.sql
-- Adds rental vertical columns to the properties table
-- ============================================================

ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS listing_type TEXT CHECK (listing_type IN ('Sale', 'Rent')) DEFAULT 'Sale',
  ADD COLUMN IF NOT EXISTS rent_per_month NUMERIC,
  ADD COLUMN IF NOT EXISTS maintenance NUMERIC,
  ADD COLUMN IF NOT EXISTS advance NUMERIC,
  ADD COLUMN IF NOT EXISTS gst NUMERIC;
