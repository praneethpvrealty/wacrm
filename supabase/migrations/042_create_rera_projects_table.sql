-- ============================================================
-- 042_create_rera_projects_table.sql
-- Creates rera_projects table to store all sourced real estate projects
-- ============================================================

CREATE TABLE IF NOT EXISTS rera_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rera_registration_number TEXT UNIQUE, -- e.g. PRM/KA/RERA/...
  name TEXT NOT NULL,                  -- Project name (e.g. Prestige Lakeside Habitat)
  promoter_name TEXT,                  -- Developer name (e.g. Prestige Group)
  project_type TEXT,                   -- Apartment, Villa, Layout/Plot
  sublocality TEXT,                    -- Resolved area (e.g. Whitefield, Sarjapur)
  city TEXT DEFAULT 'Bangalore',
  state TEXT DEFAULT 'Karnataka',
  address TEXT,
  completion_date DATE,
  total_units INTEGER,
  total_land_area NUMERIC,
  location_coordinates TEXT,           -- Latitude, Longitude string representation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable full-text search indexing on name & sublocality for fast lookups
CREATE INDEX IF NOT EXISTS idx_rera_projects_search 
  ON rera_projects USING gin (to_tsvector('english', name || ' ' || COALESCE(sublocality, '')));

-- Row Level Security
ALTER TABLE rera_projects ENABLE ROW LEVEL SECURITY;

-- Allow read-only access for authenticated users
DROP POLICY IF EXISTS "Allow authenticated users to read RERA projects" ON rera_projects;
CREATE POLICY "Allow authenticated users to read RERA projects"
  ON rera_projects FOR SELECT
  TO authenticated
  USING (true);

-- Allow service_role to insert/update projects (for script data insertion)
DROP POLICY IF EXISTS "Allow service_role full access to RERA projects" ON rera_projects;
CREATE POLICY "Allow service_role full access to RERA projects"
  ON rera_projects FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
