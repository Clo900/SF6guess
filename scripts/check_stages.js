
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oemgwfeujpznempmjvoh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbWd3ZmV1anB6bmVtcG1qdm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTk2MDgsImV4cCI6MjA4OTA3NTYwOH0.EivSg9hwWlBp6__CvoDN1WeygGIZZjEBkqSu_VzoMRg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: stages, error } = await supabase
    .from('stages')
    .select('*')
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching stages:', error);
    return;
  }
  
  console.log('Stages:', JSON.stringify(stages, null, 2));

  if (stages.length > 0) {
      // Also check groups for each stage
      for (const stage of stages) {
          const { data: groups } = await supabase
              .from('groups')
              .select('id, name')
              .eq('stage_id', stage.id);
          console.log(`Groups for stage ${stage.name}:`, groups);
      }
  }
}

main();
