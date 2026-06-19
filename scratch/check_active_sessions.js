const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cvmgojajtegbuuujtptn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWdvamFqdGVnYnV1dWp0cHRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAzMzUyNiwiZXhwIjoyMDk1NjA5NTI2fQ.NUuWkZa49alEziMFGZA8KgDrHqb_89wPjeMm1dvGeB4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const contactId = 'be5b10d1-3867-44ee-af94-3be76ac7bd4f'; // Praneeth Kumar Sajepa
  
  console.log("🔍 Checking active property draft sessions...");
  const { data: propSessions, error: propErr } = await supabase
    .from('property_draft_sessions')
    .select('*')
    .eq('contact_id', contactId);
    
  if (propErr) {
    console.error("❌ Error fetching property sessions:", propErr);
  } else {
    console.log("Property draft sessions:", JSON.stringify(propSessions, null, 2));
  }

  console.log("\n🔍 Checking active contact draft sessions...");
  const { data: contactSessions, error: contactErr } = await supabase
    .from('contact_draft_sessions')
    .select('*')
    .eq('contact_id', contactId);
    
  if (contactErr) {
    console.error("❌ Error fetching contact sessions:", contactErr);
  } else {
    console.log("Contact draft sessions:", JSON.stringify(contactSessions, null, 2));
  }
}

main().catch(console.error);
