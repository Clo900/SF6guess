-- Reset Stage 2 Qualifier Matches teams to NULL

DO $$
DECLARE
    v_stage_id uuid;
    v_group_e_id uuid;
    v_group_f_id uuid;
    v_group_g_id uuid;
    v_group_h_id uuid;
    
    -- Seed Team IDs
    v_liyufan_id uuid;
    v_xiutai_id uuid;
    v_banana_id uuid;
    v_pluto_id uuid;

BEGIN
    -- Get Stage 2 ID
    SELECT id INTO v_stage_id FROM stages WHERE name = '第二阶段' LIMIT 1;
    
    IF v_stage_id IS NOT NULL THEN
        -- Get Seed Teams
        SELECT id INTO v_liyufan_id FROM teams WHERE name = '鲤鱼饭';
        SELECT id INTO v_xiutai_id FROM teams WHERE name = '秀太';
        SELECT id INTO v_banana_id FROM teams WHERE name = '香蕉';
        SELECT id INTO v_pluto_id FROM teams WHERE name = '普鲁托';

        -- Update Matches in Stage 2
        -- We want to set team1_id and team2_id to NULL where the match does NOT involve a seed team.
        -- We can join with groups to filter by stage.
        
        UPDATE matches
        SET team1_id = NULL, team2_id = NULL
        WHERE group_id IN (SELECT id FROM groups WHERE stage_id = v_stage_id)
        AND (team1_id NOT IN (v_liyufan_id, v_xiutai_id, v_banana_id, v_pluto_id) OR team1_id IS NULL)
        AND (team2_id NOT IN (v_liyufan_id, v_xiutai_id, v_banana_id, v_pluto_id) OR team2_id IS NULL);
        
    END IF;
END $$;
