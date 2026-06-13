-- Create sequence starting at 1001 for sequential human-readable codes
CREATE SEQUENCE IF NOT EXISTS property_code_seq START WITH 1001;

-- Add property_code column to properties table
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS property_code TEXT DEFAULT 'PROP-' || nextval('property_code_seq');

-- Backfill any existing properties that don't have code
UPDATE properties 
  SET property_code = 'PROP-' || nextval('property_code_seq')
  WHERE property_code IS NULL;

-- Make it unique and index it
CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_property_code ON properties(property_code);
