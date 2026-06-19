const { createClient } = require('@supabase/supabase-js');

// Config from .env.local
const supabaseUrl = 'https://cvmgojajtegbuuujtptn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWdvamFqdGVnYnV1dWp0cHRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAzMzUyNiwiZXhwIjoyMDk1NjA5NTI2fQ.NUuWkZa49alEziMFGZA8KgDrHqb_89wPjeMm1dvGeB4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSwamiMessages() {
  try {
    console.log("🔍 Fetching all local WhatsApp templates...");
    const { data: templates, error: tempErr } = await supabase
      .from('message_templates')
      .select('*');

    if (tempErr) {
      console.error("❌ Error fetching templates:", tempErr);
    } else if (!templates || templates.length === 0) {
      console.log("❓ No templates found in the database.");
    } else {
      console.log(`✅ Found ${templates.length} templates:`);
      templates.forEach((t) => {
        console.log(`\n--- Template: ${t.name} (${t.language || 'en_US'}) ---`);
        console.log(`   Status: ${t.status}`);
        console.log(`   Header Type: ${t.header_type}`);
        console.log(`   Body Text: "${t.body_text}"`);
        if (t.buttons) {
          console.log(`   Buttons:`, JSON.stringify(t.buttons, null, 2));
        }
      });
    }

    console.log("\n🔍 Querying property 'Old House in Koramangala 1st Block'...");
    const { data: properties, error: propErr } = await supabase
      .from('properties')
      .select('*')
      .ilike('title', '%Old House in Koramangala 1st Block%');

    if (propErr) {
      console.error("❌ Error fetching property:", propErr);
    } else if (!properties || properties.length === 0) {
      console.log("❓ Property 'Old House in Koramangala 1st Block' not found.");
    } else {
      console.log(`✅ Found ${properties.length} matching property:`);
      properties.forEach((p) => {
        console.log(`   ID: ${p.id}`);
        console.log(`   Title: ${p.title}`);
        console.log(`   Images:`, p.images);
        console.log(`   Nearby Highlights:`, p.nearby_highlights);
        console.log(`   Features:`, p.features);
      });
    }

    console.log("\n🔍 Searching database for contacts matching 'Swami' or 'Swamy'...");
    const { data: contacts, error: contactErr } = await supabase
      .from('contacts')
      .select('*')
      .or('name.ilike.%Swamy%,name.ilike.%Swami%');
      
    if (contactErr) {
      console.error("❌ Error fetching contacts:", contactErr);
      return;
    }
    
    if (!contacts || contacts.length === 0) {
      console.log("❓ No contact matching 'Swami' or 'Swamy' was found in the database.");
      return;
    }
    
    console.log(`\n✅ Found ${contacts.length} matching contact(s):`);
    for (const contact of contacts) {
      console.log(`\n================================================`);
      console.log(`👤 Contact: ${contact.name} (${contact.phone})`);
      console.log(`   ID: ${contact.id}`);
      console.log(`   Classification: ${contact.classification}`);
      console.log(`   Status: ${contact.status}`);
      console.log(`================================================`);
      
      // Fetch conversations for this contact
      const { data: convs, error: convErr } = await supabase
        .from('conversations')
        .select('*')
        .eq('contact_id', contact.id);
        
      if (convErr) {
        console.error("❌ Error fetching conversations:", convErr);
        continue;
      }
      
      if (!convs || convs.length === 0) {
        console.log("⚠️ No active conversation thread found for this contact.");
        continue;
      }
      
      for (const conv of convs) {
        console.log(`💬 Conversation ID: ${conv.id}`);
        console.log(`   Status: ${conv.status}`);
        console.log(`   Unread Count: ${conv.unread_count}`);
        console.log(`   Last Message Text: "${conv.last_message_text}"`);
        console.log(`   Last Message At: ${conv.last_message_at}`);
        
        // Fetch all messages for this conversation
        const { data: messages, error: msgErr } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false });
          
        if (msgErr) {
          console.error("❌ Error fetching messages:", msgErr);
          continue;
        }
        
        if (!messages || messages.length === 0) {
          console.log("   No messages found in this conversation thread.");
          continue;
        }
        
        console.log(`\n📋 Messages in Thread (Newest to Oldest, Total: ${messages.length}):`);
        messages.forEach((msg, idx) => {
          console.log(`\n   [${idx + 1}] Sent At: ${msg.created_at}`);
          console.log(`       ID: ${msg.id}`);
          console.log(`       Sender Type: ${msg.sender_type}`);
          console.log(`       Content Type: ${msg.content_type}`);
          console.log(`       Status: ${msg.status ? msg.status.toUpperCase() : 'N/A'}`);
          console.log(`       Message ID (Meta): ${msg.message_id}`);
          console.log(`       Content Text:`);
          console.log(`----------------------------------------`);
          console.log(msg.content_text || '[No Content]');
          console.log(`----------------------------------------`);
        });
      }
    }
  } catch (err) {
    console.error("❌ Execution error:", err);
  }
}

checkSwamiMessages();
