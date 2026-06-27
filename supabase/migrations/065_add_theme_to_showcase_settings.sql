-- Migration 065: Add theme customization to showcase_settings table
-- Allows agency showcase administrators to select a primary color theme
-- (Violet, Emerald, Cobalt, Amber, Rose) for their public property website portal.

ALTER TABLE showcase_settings
  ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'violet';

COMMENT ON COLUMN showcase_settings.theme IS
  'Theme accent color used on the public property showcase portal. Supported values: violet, emerald, cobalt, amber, rose.';
