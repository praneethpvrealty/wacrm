const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function list() {
  console.log('Fetching templates...')
  const { data: templates, error } = await supabase.from('message_templates').select('*')
  if (error) {
    console.error('Error fetching templates:', error)
    return
  }

  console.log('Templates found:')
  templates?.forEach(t => {
    console.log(`- Name: ${t.name}, Category: ${t.category}, Language: ${t.language}, Status: ${t.status}`)
    console.log(`  Body: ${t.body_text}`)
    console.log(`  Header Type: ${t.header_type}`)
    console.log(`  Buttons:`, t.buttons)
    console.log('---')
  })
}

list()
