const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://cvmgojajtegbuuujtptn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWdvamFqdGVnYnV1dWp0cHRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAzMzUyNiwiZXhwIjoyMDk1NjA5NTI2fQ.NUuWkZa49alEziMFGZA8KgDrHqb_89wPjeMm1dvGeB4'
);

async function main() {
  const { data: logs, error: err1 } = await supabase
    .from('email_sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (err1) {
    console.error('Logs error:', err1);
  } else {
    console.log('--- Last 5 Sync Logs ---');
    console.log(JSON.stringify(logs, null, 2));
  }

  const { data: configs, error: err2 } = await supabase
    .from('email_sync_configs')
    .select('*')
    .limit(5);

  if (err2) {
    console.error('Configs error:', err2);
  } else {
    console.log('--- Configs ---');
    console.log(JSON.stringify(configs, null, 2));
  }
}

main();
