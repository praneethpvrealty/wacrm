const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env variables manually from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  }
}

// Phone normalisation helpers
function normalizePhone(phone) {
  if (phone === null || phone === undefined) return '';
  const phoneStr = String(phone);
  return phoneStr.replace(/\D/g, '');
}

function phonesMatch(phone1, phone2) {
  const n1 = normalizePhone(phone1);
  const n2 = normalizePhone(phone2);
  if (n1 === n2) return true;
  if (n1.length >= 8 && n2.length >= 8) {
    return n1.slice(-8) === n2.slice(-8);
  }
  return false;
}

const supabaseUrl = 'https://cvmgojajtegbuuujtptn.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWdvamFqdGVnYnV1dWp0cHRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAzMzUyNiwiZXhwIjoyMDk1NjA5NTI2fQ.NUuWkZa49alEziMFGZA8KgDrHqb_89wPjeMm1dvGeB4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("=== 1. OWNER PROFILES IN DATABASE ===");
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('user_id, account_id, account_role, phone, full_name')
    .eq('account_role', 'owner');
  
  if (profErr) {
    console.error("❌ Error fetching profiles:", profErr);
    return;
  }
  
  console.log(JSON.stringify(profiles, null, 2));

  console.log("\n=== 2. LATEST CONVERSATIONS ===");
  const { data: convs, error: convErr } = await supabase
    .from('conversations')
    .select(`
      id,
      contact:contacts(id, name, phone),
      last_message_text,
      last_message_at
    `)
    .order('last_message_at', { ascending: false })
    .limit(5);

  if (convErr) {
    console.error("❌ Error fetching conversations:", convErr);
  } else {
    console.log(JSON.stringify(convs, null, 2));
  }

  console.log("\n=== 3. LATEST MESSAGES RECEIVED ===");
  const { data: messages, error: msgErr } = await supabase
    .from('messages')
    .select(`
      id,
      sender_type,
      content_text,
      created_at,
      conversation:conversations(contact:contacts(phone, name))
    `)
    .eq('sender_type', 'customer')
    .order('created_at', { ascending: false })
    .limit(5);

  if (msgErr) {
    console.error("❌ Error fetching messages:", msgErr);
  } else {
    messages.forEach((msg, idx) => {
      const senderPhone = msg.conversation?.contact?.phone || 'unknown';
      const senderName = msg.conversation?.contact?.name || 'unknown';
      console.log(`[${idx+1}] From: ${senderName} (${senderPhone}) at ${msg.created_at}`);
      console.log(`    Content: "${msg.content_text}"`);
      
      // Simulate Owner Check
      let matchedOwner = null;
      for (const owner of profiles) {
        if (owner.phone && phonesMatch(owner.phone, senderPhone)) {
          matchedOwner = owner;
          break;
        }
      }
      if (matchedOwner) {
        console.log(`    ✅ MATCHED OWNER: ${matchedOwner.full_name || matchedOwner.user_id}`);
      } else {
        console.log(`    ❌ NOT MATCHED WITH ANY ACCOUNT OWNER`);
      }
    });
  }

  console.log("\n=== 4. TESTING GEMINI CLASSIFIER ===");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("⚠️ GEMINI_API_KEY is not configured in .env.local.");
    return;
  }
  
  const testMsg = "Hi User, Shreenath, 917893444713 is interested in SJR Blue Waters, Sarjapur Road Magicbricks";
  console.log(`Sending classification query for: "${testMsg}"`);
  
  const systemInstruction =
    "You are an expert real estate CRM classifier. Your job is to classify if the incoming message (which can be text and/or an image) is:\n" +
    "1. 'property': A property listing to be added to inventory, layout plan, listing advertisement, or property details description.\n" +
    "2. 'contact': Contact details, vCard details, request to add/save a contact/lead, screenshot of contact/profile details, or lead forwarding/inquiry messages containing contact name/phone and their property interest (e.g. 'VaishaliGaur, 917737932199 is interested in SJR Blue Waters' or Magicbricks/99acres/Housing forwards).\n" +
    "3. 'none': Neither of the above.\n\n" +
    "Only respond with exactly 'property', 'contact', or 'none'. Absolutely no markdown, no punctuation, and no other text.";
    
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Classify this content:\n\n"${testMsg}"` }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    });
    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Gemini Classifier Response:", JSON.stringify(result));
  } catch (err) {
    console.error("❌ Gemini Call Failed:", err);
  }
}

main().catch(console.error);
