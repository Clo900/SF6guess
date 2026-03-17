-- Reset Group B match: 墨昀 vs Gimmick
DO $$
DECLARE
    v_group_id uuid;
    v_team_moyun_id uuid;
    v_team_gimmick_id uuid;
    v_match_id uuid;
    v_match_wf_id uuid; -- Winner's Final
    v_match_lr1_id uuid; -- Loser's Round 1
BEGIN
    -- Get Group B ID
    SELECT id INTO v_group_id FROM groups WHERE name = 'B组' LIMIT 1;
    
    -- Get Team IDs
    SELECT id INTO v_team_moyun_id FROM teams WHERE name = '墨昀';
    SELECT id INTO v_team_gimmick_id FROM teams WHERE name = 'Gimmick';

    -- Find the specific match (Round 1)
    SELECT id INTO v_match_id 
    FROM matches 
    WHERE group_id = v_group_id 
    AND (
        (team1_id = v_team_moyun_id AND team2_id = v_team_gimmick_id) 
        OR 
        (team1_id = v_team_gimmick_id AND team2_id = v_team_moyun_id)
    );

    -- Reset the match result
    UPDATE matches 
    SET winner_id = NULL, 
        score = NULL
    WHERE id = v_match_id;

    -- Clear Winner's Final slot (Match 3)
    SELECT id INTO v_match_wf_id FROM matches WHERE group_id = v_group_id ORDER BY created_at ASC OFFSET 2 LIMIT 1;
    
    -- Check which slot was filled by this match (based on order)
    IF v_match_id = (SELECT id FROM matches WHERE group_id = v_group_id ORDER BY created_at ASC OFFSET 0 LIMIT 1) THEN
        UPDATE matches SET team1_id = NULL WHERE id = v_match_wf_id;
    ELSE
        UPDATE matches SET team2_id = NULL WHERE id = v_match_wf_id;
    END IF;

    -- Clear Loser's Round 1 slot (Match 4)
    SELECT id INTO v_match_lr1_id FROM matches WHERE group_id = v_group_id ORDER BY created_at ASC OFFSET 3 LIMIT 1;

    IF v_match_id = (SELECT id FROM matches WHERE group_id = v_group_id ORDER BY created_at ASC OFFSET 0 LIMIT 1) THEN
        UPDATE matches SET team1_id = NULL WHERE id = v_match_lr1_id;
    ELSE
        UPDATE matches SET team2_id = NULL WHERE id = v_match_lr1_id;
    END IF;

END $$;
