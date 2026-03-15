
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oemgwfeujpznempmjvoh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbWd3ZmV1anB6bmVtcG1qdm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTk2MDgsImV4cCI6MjA4OTA3NTYwOH0.EivSg9hwWlBp6__CvoDN1WeygGIZZjEBkqSu_VzoMRg';

// Using service role key for admin operations if possible, but I only have anon key here.
// Wait, if RLS is disabled (which it seems to be based on previous get_tables output), anon key might work for update/delete.
// Let's try. If not, I'll need service role key.
// The user provided service_role_key in previous turn output!
// service_role_key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbWd3ZmV1anB6bmVtcG1qdm9oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ5OTYwOCwiZXhwIjoyMDg5MDc1NjA4fQ.lR92HWeHozVSYPiA4FztFLUcpETDeDp7EkrcFFBaSuY

const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbWd3ZmV1anB6bmVtcG1qdm9oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ5OTYwOCwiZXhwIjoyMDg5MDc1NjA4fQ.lR92HWeHozVSYPiA4FztFLUcpETDeDp7EkrcFFBaSuY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log('Starting migration...');

  // 1. Get Target Stage ID (第二阶段)
  const { data: targetStage, error: targetError } = await supabase
    .from('stages')
    .select('id')
    .eq('name', '第二阶段')
    .single();

  if (targetError || !targetStage) {
    console.error('Target stage not found:', targetError);
    return;
  }
  console.log('Target Stage ID:', targetStage.id);

  // 2. Get Source Stage ID (Stage 2)
  const { data: sourceStage, error: sourceError } = await supabase
    .from('stages')
    .select('id')
    .eq('name', 'Stage 2')
    .single();

  if (sourceError || !sourceStage) {
    console.error('Source stage not found (maybe already migrated):', sourceError);
    return;
  }
  console.log('Source Stage ID:', sourceStage.id);

  // 3. Move Groups
  const { error: updateError } = await supabase
    .from('groups')
    .update({ stage_id: targetStage.id })
    .eq('stage_id', sourceStage.id);

  if (updateError) {
    console.error('Error updating groups:', updateError);
    return;
  }
  console.log('Groups updated successfully.');

  // 4. Delete Source Stage
  const { error: deleteError } = await supabase
    .from('stages')
    .delete()
    .eq('id', sourceStage.id);

  if (deleteError) {
    console.error('Error deleting source stage:', deleteError);
    return;
  }
  console.log('Source stage deleted successfully.');
}

main();
