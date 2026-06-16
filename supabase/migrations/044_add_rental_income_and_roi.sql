-- ============================================================
-- 044_add_rental_income_and_roi.sql
-- Adds rental_income and roi columns to properties table
-- ============================================================

ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS rental_income NUMERIC,
  ADD COLUMN IF NOT EXISTS roi NUMERIC;
