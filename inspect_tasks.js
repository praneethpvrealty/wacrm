const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cvmgojajtegbuuujtptn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWdvamFqdGVnYnV1dWp0cHRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAzMzUyNiwiZXhwIjoyMDk1NjA5NTI2fQ.NUuWkZa49alEziMFGZA8KgDrHqb_89wPjeMm1dvGeB4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  try {
    // Fetch all contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, name, phone, email');
    if (contactsError) throw contactsError;
    console.log("=== CONTACTS ===");
    console.log(JSON.stringify(contacts, null, 2));

    // Fetch todos
    const { data: todos, error: todosError } = await supabase
      .from('todos')
      .select('id, title, description, contact_id, property_id');
    if (todosError) throw todosError;
    console.log("\n=== TODOS ===");
    console.log(JSON.stringify(todos, null, 2));

    // Fetch conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, contact_id, last_message_text');
    if (convError) throw convError;
    console.log("\n=== CONVERSATIONS ===");
    console.log(JSON.stringify(conversations, null, 2));

  } catch (err) {
    console.error(err);
  }
}

inspect();
