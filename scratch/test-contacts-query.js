const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("Testing query...");
  try {
    // Let's get one account first to get a valid account_id
    const { data: accounts, error: accError } = await supabase.from('accounts').select('id, name').limit(5);
    if (accError) throw accError;
    console.log("Accounts found:", accounts);

    if (accounts && accounts.length > 0) {
      const accountId = accounts[0].id;
      console.log(`Querying contacts for account_id: ${accountId}...`);
      const { data: contacts, error: contactError } = await supabase
        .from('contacts')
        .select('*, contact_notes(note_text)')
        .eq('account_id', accountId)
        .eq('status', 'active')
        .order('name');
      
      if (contactError) throw contactError;
      console.log(`Successfully fetched ${contacts.length} contacts!`);
      if (contacts.length > 0) {
        console.log("Sample contact:", JSON.stringify(contacts[0], null, 2));
      }
    }
  } catch (err) {
    console.error("Error running query:", err);
  }
}

run();
