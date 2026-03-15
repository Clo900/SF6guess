-- Insert Stage 2
INSERT INTO stages (tournament_id, name, "order")
SELECT id, 'Stage 2', 2
FROM tournaments
LIMIT 1;

-- Get Stage 2 ID
DO $$
DECLARE
  v_stage_id uuid;
  v_group_e_id uuid;
  v_group_f_id uuid;
  v_group_g_id uuid;
  v_group_h_id uuid;
  
  -- Seed Teams
  v_liyufan_id uuid;
  v_xiutai_id uuid;
  v_banana_id uuid;
  v_pluto_id uuid;
  
  -- Placeholder Teams
  v_b1_id uuid;
  v_c2_id uuid;
  v_a1_id uuid;
  v_d2_id uuid;
  v_d1_id uuid;
  v_b2_id uuid;
  v_c1_id uuid;
  v_a2_id uuid;

BEGIN
  SELECT id INTO v_stage_id FROM stages WHERE name = 'Stage 2' LIMIT 1;

  -- Insert Groups
  INSERT INTO groups (stage_id, name, type) VALUES (v_stage_id, 'E组', 'Knockout') RETURNING id INTO v_group_e_id;
  INSERT INTO groups (stage_id, name, type) VALUES (v_stage_id, 'F组', 'Knockout') RETURNING id INTO v_group_f_id;
  INSERT INTO groups (stage_id, name, type) VALUES (v_stage_id, 'G组', 'Knockout') RETURNING id INTO v_group_g_id;
  INSERT INTO groups (stage_id, name, type) VALUES (v_stage_id, 'H组', 'Knockout') RETURNING id INTO v_group_h_id;

  -- Insert/Get Seed Teams
  INSERT INTO teams (name) VALUES ('鲤鱼饭') ON CONFLICT DO NOTHING;
  SELECT id INTO v_liyufan_id FROM teams WHERE name = '鲤鱼饭';
  
  INSERT INTO teams (name) VALUES ('秀太') ON CONFLICT DO NOTHING;
  SELECT id INTO v_xiutai_id FROM teams WHERE name = '秀太';
  
  INSERT INTO teams (name) VALUES ('香蕉') ON CONFLICT DO NOTHING;
  SELECT id INTO v_banana_id FROM teams WHERE name = '香蕉';
  
  INSERT INTO teams (name) VALUES ('普鲁托') ON CONFLICT DO NOTHING;
  SELECT id INTO v_pluto_id FROM teams WHERE name = '普鲁托';

  -- Insert Placeholder Teams
  INSERT INTO teams (name) VALUES ('B组第一') RETURNING id INTO v_b1_id;
  INSERT INTO teams (name) VALUES ('C组第二') RETURNING id INTO v_c2_id;
  INSERT INTO teams (name) VALUES ('A组第一') RETURNING id INTO v_a1_id;
  INSERT INTO teams (name) VALUES ('D组第二') RETURNING id INTO v_d2_id;
  INSERT INTO teams (name) VALUES ('D组第一') RETURNING id INTO v_d1_id;
  INSERT INTO teams (name) VALUES ('B组第二') RETURNING id INTO v_b2_id;
  INSERT INTO teams (name) VALUES ('C组第一') RETURNING id INTO v_c1_id;
  INSERT INTO teams (name) VALUES ('A组第二') RETURNING id INTO v_a2_id;

  -- Insert Matches for Group E
  -- Match E1: B1 vs C2
  INSERT INTO matches (group_id, team1_id, team2_id) VALUES (v_group_e_id, v_b1_id, v_c2_id);
  -- Match E2: Winner E1 vs Liyufan
  INSERT INTO matches (group_id, team1_id, team2_id) VALUES (v_group_e_id, NULL, v_liyufan_id);

  -- Insert Matches for Group F
  -- Match F1: A1 vs D2
  INSERT INTO matches (group_id, team1_id, team2_id) VALUES (v_group_f_id, v_a1_id, v_d2_id);
  -- Match F2: Winner F1 vs Xiutai
  INSERT INTO matches (group_id, team1_id, team2_id) VALUES (v_group_f_id, NULL, v_xiutai_id);

  -- Insert Matches for Group G
  -- Match G1: D1 vs B2
  INSERT INTO matches (group_id, team1_id, team2_id) VALUES (v_group_g_id, v_d1_id, v_b2_id);
  -- Match G2: Winner G1 vs Banana
  INSERT INTO matches (group_id, team1_id, team2_id) VALUES (v_group_g_id, NULL, v_banana_id);

  -- Insert Matches for Group H
  -- Match H1: C1 vs A2
  INSERT INTO matches (group_id, team1_id, team2_id) VALUES (v_group_h_id, v_c1_id, v_a2_id);
  -- Match H2: Winner H1 vs Pluto
  INSERT INTO matches (group_id, team1_id, team2_id) VALUES (v_group_h_id, NULL, v_pluto_id);

END $$;
