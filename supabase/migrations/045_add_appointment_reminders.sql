-- ============================================================
-- 045_add_appointment_reminders.sql
-- Adds reminder check columns to appointments table
-- Seeds default property visit reminder template for existing accounts
-- ============================================================

-- Add reminder columns to appointments table
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_2h_sent BOOLEAN NOT NULL DEFAULT false;

-- Create default message template for existing accounts
INSERT INTO message_templates (user_id, account_id, name, category, language, body_text, status)
SELECT 
  a.owner_user_id,
  a.id as account_id,
  'property_visit_reminder' as name,
  'Utility' as category,
  'en_US' as language,
  'Hi {{1}}, this is a friendly reminder for your scheduled property visit for "{{2}}" on {{3}}. Location: {{4}}.' as body_text,
  'APPROVED' as status
FROM accounts a
ON CONFLICT (user_id, name, language) DO NOTHING;
