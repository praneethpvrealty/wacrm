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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('whatsapp_config').select('*').limit(1);
  if (error) {
    console.error('Error fetching whatsapp_config:', error);
  } else {
    console.log('whatsapp_config columns:', Object.keys(data[0] || {}));
  }

  const { data: propData, error: propError } = await supabase.from('properties').select('*').limit(1);
  if (propError) {
    console.error('Error fetching properties:', propError);
  } else {
    console.log('properties columns:', Object.keys(propData[0] || {}));
  }
}

check();
