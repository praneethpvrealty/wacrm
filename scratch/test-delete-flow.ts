import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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
    const { error: deleteError } = await supabase.from('flows').delete().eq('id', targetFlow.id)
    if (deleteError) {
      console.error('Error deleting flow:', deleteError)
    } else {
      console.log('Successfully deleted flow!')
    }
  }
}

test()
