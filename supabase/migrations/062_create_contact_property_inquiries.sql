-- ============================================================
-- 062_create_contact_property_inquiries.sql
-- Junction table to track multiple property interests per contact
-- ============================================================

CREATE TABLE IF NOT EXISTS contact_property_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  inquiry_source TEXT, -- e.g. 'Housing', '99acres', 'Manual'
  inquiry_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contact_id, property_id)
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_cpi_contact ON contact_property_inquiries(contact_id);
CREATE INDEX IF NOT EXISTS idx_cpi_property ON contact_property_inquiries(property_id);

-- Enable RLS
ALTER TABLE contact_property_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can manage inquiries for contacts they own
DROP POLICY IF EXISTS "Users can manage contact property inquiries" ON contact_property_inquiries;
CREATE POLICY "Users can manage contact property inquiries" ON contact_property_inquiries FOR ALL
  USING (EXISTS (
    SELECT 1 FROM contacts 
    WHERE contacts.id = contact_property_inquiries.contact_id 
    AND contacts.user_id = auth.uid()
  ));