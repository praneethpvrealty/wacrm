const { createClient } = require('@supabase/supabase-js');

// Config from .env.local
const supabaseUrl = 'https://cvmgojajtegbuuujtptn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWdvamFqdGVnYnV1dWp0cHRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAzMzUyNiwiZXhwIjoyMDk1NjA5NTI2fQ.NUuWkZa49alEziMFGZA8KgDrHqb_89wPjeMm1dvGeB4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("🔍 Fetching owner profiles...");
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('account_role', 'owner');
  
  if (profErr) {
    console.error("❌ Error fetching profiles:", profErr);
  } else {
    console.log("Owner Profiles found:", JSON.stringify(profiles, null, 2));
  }

  console.log("\n🔍 Fetching latest conversations...");
  const { data: convs, error: convErr } = await supabase
    .from('conversations')
    .select('id, contact_id, last_message_text, last_message_at, unread_count, status')
    .order('last_message_at', { ascending: false })
    .limit(5);

  if (convErr) {
    console.error("❌ Error fetching conversations:", convErr);
  } else {
    console.log("Latest conversations:", JSON.stringify(convs, null, 2));
  }

  console.log("\n🔍 Fetching latest 10 messages in database...");
  const { data: messages, error: msgErr } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (msgErr) {
    console.error("❌ Error fetching messages:", msgErr);
  } else {
    messages.forEach((msg, index) => {
      console.log(`\n[${index + 1}] Message ID: ${msg.id}`);
      console.log(`    Sender Type: ${msg.sender_type}`);
      console.log(`    Content Type: ${msg.content_type}`);
      console.log(`    Created At: ${msg.created_at}`);
      console.log(`    Content Text: "${msg.content_text}"`);
    });
  }
}

main().catch(console.error);
