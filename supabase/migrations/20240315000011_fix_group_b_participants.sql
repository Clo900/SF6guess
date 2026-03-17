-- Fix Group B participants: Match 1 (墨昀 vs Gimmick), Match 2 (静坐石枯 vs 王厨子)
DO $$
DECLARE
    v_group_id uuid;
    v_team_moyun_id uuid;
    v_team_gimmick_id uuid;
    v_team_jingzuo_id uuid;
    v_team_wangchuzi_id uuid;
    v_match1_id uuid;
    v_match2_id uuid;
BEGIN
    -- Get Group B ID
    SELECT id INTO v_group_id FROM groups WHERE name = 'B组' LIMIT 1;
    
    -- Get Team IDs
    SELECT id INTO v_team_moyun_id FROM teams WHERE name = '墨昀';
    SELECT id INTO v_team_gimmick_id FROM teams WHERE name = 'Gimmick';
    SELECT id INTO v_team_jingzuo_id FROM teams WHERE name = '静坐石枯';
    SELECT id INTO v_team_wangchuzi_id FROM teams WHERE name = '王厨子';

    -- Identify Match 1 (Offset 0)
    SELECT id INTO v_match1_id FROM matches WHERE group_id = v_group_id ORDER BY created_at ASC OFFSET 0 LIMIT 1;
    
    -- Update Match 1: 墨昀 vs Gimmick
    UPDATE matches 
    SET team1_id = v_team_moyun_id, 
        team2_id = v_team_gimmick_id,
        winner_id = NULL,
        score = NULL
    WHERE id = v_match1_id;

    -- Identify Match 2 (Offset 1)
    SELECT id INTO v_match2_id FROM matches WHERE group_id = v_group_id ORDER BY created_at ASC OFFSET 1 LIMIT 1;

    -- Update Match 2: 静坐石枯 vs 王厨子
    UPDATE matches 
    SET team1_id = v_team_jingzuo_id, 
        team2_id = v_team_wangchuzi_id,
        winner_id = NULL,
        score = NULL
    WHERE id = v_match2_id;

    -- Reset subsequent matches in Group B (WF and LR1) just in case
    -- We'll just set their team IDs to NULL to be safe, as participants changed.
    
    -- WF (Offset 2)
    UPDATE matches 
    SET team1_id = NULL, team2_id = NULL, winner_id = NULL, score = NULL 
    WHERE id = (SELECT id FROM matches WHERE group_id = v_group_id ORDER BY created_at ASC OFFSET 2 LIMIT 1);
    
    -- LR1 (Offset 3)
    UPDATE matches 
    SET team1_id = NULL, team2_id = NULL, winner_id = NULL, score = NULL 
    WHERE id = (SELECT id FROM matches WHERE group_id = v_group_id ORDER BY created_at ASC OFFSET 3 LIMIT 1);
    
    -- LF (Offset 4)
    UPDATE matches 
    SET team1_id = NULL, team2_id = NULL, winner_id = NULL, score = NULL 
    WHERE id = (SELECT id FROM matches WHERE group_id = v_group_id ORDER BY created_at ASC OFFSET 4 LIMIT 1);

END $$;
