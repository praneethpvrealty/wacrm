-- ============================================================
-- 053_add_catalog_id_to_whatsapp_config.sql
-- Add catalog_id and auto_sync_catalog columns to whatsapp_config
-- and meta_catalog fields to properties
-- ============================================================

ALTER TABLE whatsapp_config ADD COLUMN IF NOT EXISTS catalog_id TEXT;
ALTER TABLE whatsapp_config ADD COLUMN IF NOT EXISTS auto_sync_catalog BOOLEAN DEFAULT FALSE NOT NULL;

ALTER TABLE properties ADD COLUMN IF NOT EXISTS meta_catalog_synced_at TIMESTAMPTZ;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS meta_catalog_error TEXT;
