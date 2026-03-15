
-- Fix Stage 2 data: Move content from 'Stage 2' to '第二阶段' and delete 'Stage 2'

DO $$
DECLARE
    target_stage_id UUID;
    source_stage_id UUID;
BEGIN
    -- Get IDs
    SELECT id INTO target_stage_id FROM stages WHERE name = '第二阶段' LIMIT 1;
    SELECT id INTO source_stage_id FROM stages WHERE name = 'Stage 2' LIMIT 1;

    -- Only proceed if both exist
    IF target_stage_id IS NOT NULL AND source_stage_id IS NOT NULL THEN
        -- Move groups from Source to Target
        UPDATE groups SET stage_id = target_stage_id WHERE stage_id = source_stage_id;
        
        -- Delete the Source stage
        DELETE FROM stages WHERE id = source_stage_id;
    END IF;
END $$;
