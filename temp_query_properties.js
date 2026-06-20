const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://cvmgojajtegbuuujtptn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWdvamFqdGVnYnV1dWp0cHRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAzMzUyNiwiZXhwIjoyMDk1NjA5NTI2fQ.NUuWkZa49alEziMFGZA8KgDrHqb_89wPjeMm1dvGeB4'
);

async function run() {
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, property_code, title, meta_catalog_synced_at, meta_catalog_error')
    .order('updated_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(JSON.stringify(properties, null, 2));
}

run();
