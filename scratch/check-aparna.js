const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function check() {
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('*, contact_notes(*)')
    .ilike('name', '%aparna%')
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Contacts found:', JSON.stringify(contacts, null, 2))
}

check()
