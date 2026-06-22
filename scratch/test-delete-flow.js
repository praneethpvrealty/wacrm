const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function test() {
  console.log('Fetching flows...')
  const { data: flows, error: fetchError } = await supabase.from('flows').select('*')
  if (fetchError) {
    console.error('Error fetching flows:', fetchError)
    return
  }

  console.log('Flows found:', flows?.map(f => ({ id: f.id, name: f.name })))

  if (flows && flows.length > 0) {
    const targetFlow = flows[flows.length - 1]
    console.log(`Attempting to delete flow: ${targetFlow.name} (${targetFlow.id})`)

    console.log('First, clearing active_flow_id on contacts...')
    const { error: clearError } = await supabase
      .from('contacts')
      .update({ active_flow_id: null })
      .eq('active_flow_id', targetFlow.id)

    if (clearError) {
      console.error('Error clearing active_flow_id on contacts:', clearError)
    } else {
      console.log('Successfully cleared active_flow_id on contacts!')
    }

    const { error: deleteError } = await supabase.from('flows').delete().eq('id', targetFlow.id)
    if (deleteError) {
      console.error('Error deleting flow:', deleteError)
    } else {
      console.log('Successfully deleted flow!')
    }
  }
}

test()
