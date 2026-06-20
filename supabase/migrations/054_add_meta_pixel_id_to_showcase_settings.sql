-- ============================================================
-- 054_add_meta_pixel_id_to_showcase_settings.sql
-- Add meta_pixel_id to showcase_settings table
-- ============================================================

ALTER TABLE showcase_settings ADD COLUMN IF NOT EXISTS meta_pixel_id TEXT;
