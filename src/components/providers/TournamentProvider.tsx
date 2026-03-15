import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tournament, Stage, Group, Match, Team, Prediction, LeaderboardEntry } from '@/types';

interface TournamentContextType {
  tournament: Tournament | null;
  stages: Stage[];
  groups: Group[];
  matches: Match[];
  teams: Team[];
  predictions: Record<string, Prediction>;
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  currentStageId: string;
  setCurrentStageId: (id: string) => void;
  updatePrediction: (matchId: string, teamId: string, score?: string) => void;
  getQualifiedTeams: () => Record<string, Team>;
  clearPrediction: (matchId: string) => void;
  savePredictions: () => Promise<void>;
  currentUser: any;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentStageId, setCurrentStageId] = useState<string>('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allPredictions, setAllPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch current user from local storage (Custom Auth)
        const storedUser = localStorage.getItem('sf6guess_user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        setCurrentUser(user);

        // Fetch tournament (get the first active or upcoming one)
        const { data: tournaments } = await supabase
          .from('tournaments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (tournaments && tournaments.length > 0) {
          const currentTournament = tournaments[0];
          setTournament(currentTournament);

          // Fetch stages
          const { data: stagesData } = await supabase
            .from('stages')
            .select('*')
            .eq('tournament_id', currentTournament.id)
            .order('order');
          setStages(stagesData || []);

          if (stagesData && stagesData.length > 0) {
             setCurrentStageId(prev => prev || stagesData[0].id);
          }

          // Fetch groups
          const { data: groupsData } = await supabase
            .from('groups')
            .select('*')
            .in('stage_id', (stagesData || []).map(s => s.id));
          setGroups(groupsData || []);

          // Fetch matches
          const { data: matchesData } = await supabase
            .from('matches')
            .select('*, team1:team1_id(*), team2:team2_id(*), winner:winner_id(*)')
            .in('group_id', (groupsData || []).map(g => g.id));
          setMatches(matchesData || []);

          // Fetch teams
          const { data: teamsData } = await supabase.from('teams').select('*');
          setTeams(teamsData || []);

          // Fetch Leaderboard Data (Users + All Predictions)
          const { data: allUsersData } = await supabase.from('users').select('id, username, nickname');
          const { data: allPredictionsData } = await supabase.from('predictions').select('*');
          
          setAllUsers(allUsersData || []);
          setAllPredictions(allPredictionsData || []);

          // Fetch user predictions if logged in
          if (user) {
            const { data: predictionsData } = await supabase
              .from('predictions')
              .select('*')
              .eq('user_id', user.id);
            
            const predictionsMap: Record<string, Prediction> = {};
            predictionsData?.forEach(p => {
              predictionsMap[p.match_id] = p;
            });
            setPredictions(predictionsMap);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate Leaderboard
  useEffect(() => {
    if (!allUsers.length || !matches.length || !groups.length) return;

    const currentStageGroups = groups.filter(g => g.stage_id === currentStageId);
    const currentStageGroupIds = currentStageGroups.map(g => g.id);
    const currentStageMatches = matches.filter(m => currentStageGroupIds.includes(m.group_id));

    const leaderboardData: LeaderboardEntry[] = allUsers.map(u => {
      const userPredictions = allPredictions.filter(p => p.user_id === u.id);
      
      let score = 0;
      let correctCount = 0;
      let correctItems = 0;

      // Calculate total score from ALL predictions
      userPredictions.forEach(p => {
        const match = matches.find(m => m.id === p.match_id);
        if (match && match.winner_id) {
          // Points for correct winner
          if (match.winner_id === p.predicted_winner_id) {
            score += 5;
            correctCount++;
            correctItems++;
          }
          // Points for correct score
          if (match.score && match.score === p.predicted_score) {
            score += 10;
            correctItems++;
          }
        }
      });

      // Calculate items for CURRENT STAGE only
      const currentStageUserPredictions = userPredictions.filter(p => {
        const match = matches.find(m => m.id === p.match_id);
        return match && currentStageGroupIds.includes(match.group_id);
      });

      // 1 prediction = 2 items (Winner + Score)
      const total_items = currentStageUserPredictions.length * 2;
      const possible_items = currentStageMatches.length * 2;
      
      // For "correct_items" display, we might want to show correct items in current stage?
      // Or total correct items?
      // User request: "猜测数量/猜测总数显示" (Guess Quantity / Guess Total)
      // Interpretation: Participation (Saved predictions / Total matches).
      // So I will use `total_items` and `possible_items` for the second column.
      // The third column is Score.

      return {
        user_id: u.id,
        username: u.username,
        nickname: u.nickname,
        score: score,
        correct_predictions: correctCount,
        total_predictions: userPredictions.length,
        correct_items: correctItems, // Total correct items (for reference)
        total_items: total_items,    // Saved items in current stage
        possible_items: possible_items, // Total possible items in current stage
        accuracy: userPredictions.length > 0 ? (correctCount / userPredictions.length) * 100 : 0
      };
    });

    // Sort by score descending
    leaderboardData.sort((a, b) => b.score - a.score);
    setLeaderboard(leaderboardData);

  }, [allUsers, allPredictions, matches, groups, currentStageId]);

  const getQualifiedTeams = () => {
    // This logic needs to find the winners of the previous stage
    // Specifically for Stage 1 -> Stage 2
    // Stage 1 groups: A, B, C, D
    // Qualified: A1, A2, B1, B2, C1, C2, D1, D2
    
    // We can infer this from the matches in Stage 1
    // A1 = Winner of Group A Winner's Final
    // A2 = Winner of Group A Loser's Final
    
    const qualified: Record<string, Team> = {};
    const stage1 = stages.find(s => s.name === '第一阶段');
    if (!stage1) return qualified;
    
    const stage1Groups = groups.filter(g => g.stage_id === stage1.id);
    
    stage1Groups.forEach(group => {
       const groupMatches = matches.filter(m => m.group_id === group.id);
       // Assuming match order: M0, M1, M2(WF), M3(LR1), M4(LF)
       // This order assumption is critical.
       // M2 Winner -> Group 1st
       // M4 Winner -> Group 2nd
       
       // Sort by created_at to be safer? Or rely on index if consistent.
       // Let's assume index 2 is WF and index 4 is LF if we sort by scheduled/created.
       // Actually, let's just use the winner_id if set.
       
       if (groupMatches.length >= 5) {
         const wf = groupMatches[2];
         const lf = groupMatches[4];
         
         if (wf && wf.winner_id) {
           const team = teams.find(t => t.id === wf.winner_id);
           if (team) qualified[`${group.name}第一`] = team;
         }
         
         if (lf && lf.winner_id) {
           const team = teams.find(t => t.id === lf.winner_id);
           if (team) qualified[`${group.name}第二`] = team;
         }
       }
    });
    
    return qualified;
  };

  const updatePrediction = (matchId: string, teamId: string, score: string = '0:0') => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        match_id: matchId,
        predicted_winner_id: teamId,
        predicted_score: score,
        user_id: currentUser?.id || 'temp-user',
        id: prev[matchId]?.id || crypto.randomUUID(),
        created_at: new Date().toISOString()
      }
    }));
  };

  const clearPrediction = (matchId: string) => {
    setPredictions(prev => {
      const newPredictions = { ...prev };
      delete newPredictions[matchId];
      return newPredictions;
    });
  };

  // Effect to handle bracket logic flow
  useEffect(() => {
    if (matches.length === 0 || groups.length === 0) return;

    let hasChanges = false;
    const updatedMatches = [...matches];
    const updatedPredictions = { ...predictions };

    groups.forEach(group => {
      const groupMatches = updatedMatches.filter(m => m.group_id === group.id);
      if (groupMatches.length < 5) return;

      // Ensure sorted order: M0, M1 (R1), M2 (WF), M3 (LR1), M4 (LF)
      // We assume the DB returns them in a consistent order or we sort by scheduled_at/created_at
      // For now, let's assume the array index corresponds to the flow if created sequentially.
      // If not, we might need a better way. But based on seed, they are sequential.
      
      const m0 = groupMatches[0];
      const m1 = groupMatches[1];
      const m2 = groupMatches[2];
      const m3 = groupMatches[3];
      const m4 = groupMatches[4];

      const getWinner = (m: Match) => {
        const p = updatedPredictions[m.id];
        return p?.predicted_winner_id ? teams.find(t => t.id === p.predicted_winner_id) : undefined;
      };

      const getLoser = (m: Match) => {
        const p = updatedPredictions[m.id];
        if (p?.predicted_winner_id) {
          return m.team1_id === p.predicted_winner_id 
            ? teams.find(t => t.id === m.team2_id)
            : teams.find(t => t.id === m.team1_id);
        }
        return undefined;
      };

      // Helper to update match if changed
      const updateMatch = (m: Match, t1?: Team, t2?: Team) => {
        if (m.team1_id !== t1?.id || m.team2_id !== t2?.id) {
          m.team1 = t1; m.team1_id = t1?.id;
          m.team2 = t2; m.team2_id = t2?.id;
          hasChanges = true;
          
          // If participants changed, invalidate prediction for this match
          const p = updatedPredictions[m.id];
          if (p) {
             // Check if predicted winner is still valid
             const isValid = (t1 && p.predicted_winner_id === t1.id) || (t2 && p.predicted_winner_id === t2.id);
             if (!isValid) {
               delete updatedPredictions[m.id];
               // We don't set hasChanges for prediction here to avoid loop? 
               // No, we need to save this change.
             }
          }
        }
      };

      const w0 = getWinner(m0);
      const w1 = getWinner(m1);
      updateMatch(m2, w0, w1);

      const l0 = getLoser(m0);
      const l1 = getLoser(m1);
      updateMatch(m3, l0, l1);

      const l2 = getLoser(m2);
      const w3 = getWinner(m3);
      updateMatch(m4, l2, w3);
    });

    if (hasChanges) {
       // Batch updates
       setMatches(updatedMatches);
       
       // Compare predictions to see if we need to update them
       const predChanged = JSON.stringify(predictions) !== JSON.stringify(updatedPredictions);
       if (predChanged) {
         setPredictions(updatedPredictions);
       }
    }
  }, [predictions, groups, teams]); // Only re-run if predictions change (or static data loads)

  // Remove matches from dependency to avoid loop, 
  // but we need 'matches' initial state. 
  // If setMatches updates 'matches', this effect runs again.
  // But 'hasChanges' should be false next time if logic is stable.
  // Ideally, use a ref or separate state for 'baseMatches' vs 'derivedMatches'.
  // But here we mutate 'matches' state which is risky.
  
  // Safe approach: Only run when `predictions` changes. 
  // And `matches` should be stable if no predictions change.
  // But `setMatches` changes `matches` reference.
  // So we need to be careful.
  // Let's add `matches` to dependency but ensure convergence.




  const savePredictions = async () => {
    if (!currentUser) {
      alert('请先登录以保存预测');
      return;
    }

    try {
      const predictionsToUpsert = Object.values(predictions).map(p => ({
        user_id: currentUser.id,
        match_id: p.match_id,
        predicted_winner_id: p.predicted_winner_id,
        predicted_score: p.predicted_score
      }));

      const { error } = await supabase
        .from('predictions')
        .upsert(predictionsToUpsert, { onConflict: 'user_id,match_id' });

      if (error) throw error;
      alert('保存成功！');
    } catch (error) {
      console.error('Error saving predictions:', error);
      alert('保存失败，请重试');
    }
  };

  return (
    <TournamentContext.Provider value={{
      tournament,
      stages,
      groups,
      matches,
      teams,
      predictions,
      leaderboard,
      loading,
      currentStageId,
      setCurrentStageId,
      updatePrediction,
      getQualifiedTeams,
      clearPrediction,
      savePredictions,
      currentUser
    }}>
      {children}
    </TournamentContext.Provider>
  );
};
