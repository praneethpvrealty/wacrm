-- Migration 061: Add auto_reply_template_name to email_sync_configs and seed default lead welcome template
ALTER TABLE email_sync_configs 
  ADD COLUMN IF NOT EXISTS auto_reply_template_name TEXT;

-- Delete any existing default welcome template with the same name to prevent duplicates
DELETE FROM message_templates WHERE name = 'lead_welcome_utility';

-- Seed default Utility lead welcome template for all existing accounts
INSERT INTO message_templates (user_id, account_id, name, category, language, body_text, buttons, status)
SELECT 
  a.owner_user_id,
  a.id as account_id,
  'lead_welcome_utility' as name,
  'Utility' as category,
  'en_US' as language,
  'Hi {{1}}, thanks for your interest on the property listed on {{2}}. Kindly let us know your requirments and budget. We will get back to you shortly.' as body_text,
  '[{"type": "URL", "text": "View Showcase", "url": "https://www.convoreal.com/{{1}}", "example": "https://www.convoreal.com/?ref=4f1247de-269c-47c2-8974-36ef8f77f77d"}]'::jsonb as buttons,
  'APPROVED' as status
FROM accounts a;
