-- Add referrer text and referrer_contact_id to contacts
ALTER TABLE contacts 
  ADD COLUMN IF NOT EXISTS referrer TEXT,
  ADD COLUMN IF NOT EXISTS referrer_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_referrer_contact ON contacts(referrer_contact_id);

-- Add owner_contact_id to properties referencing contacts
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS owner_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_properties_owner_contact ON properties(owner_contact_id);
