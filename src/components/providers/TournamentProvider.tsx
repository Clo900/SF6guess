import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tournament, Stage, Group, Match, Team, Prediction, LeaderboardEntry, User } from '@/types';

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
  currentUser: User | null;
  isStageLocked: (stageId: string) => boolean;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStageId, setCurrentStageId] = useState<string>('');
  const [allUsers, setAllUsers] = useState<Pick<User, 'id' | 'username' | 'nickname'>[]>([]);
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

  // Real-time subscriptions
  useEffect(() => {
    if (groups.length === 0) return;

    const refreshMatches = async () => {
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*, team1:team1_id(*), team2:team2_id(*), winner:winner_id(*)')
        .in('group_id', groups.map(g => g.id));
      
      if (matchesData) {
        setMatches(matchesData);
      }
    };

    const refreshPredictions = async () => {
      const { data: allPredictionsData } = await supabase.from('predictions').select('*');
      if (allPredictionsData) {
        setAllPredictions(allPredictionsData);
      }
    };

    const refreshStages = async () => {
      if (!tournament) return;
      const { data: stagesData } = await supabase
        .from('stages')
        .select('*')
        .eq('tournament_id', tournament.id)
        .order('order');
      if (stagesData) {
        setStages(stagesData);
      }
    };

    // Subscribe
    const channel = supabase
      .channel('tournament_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        (payload) => {
          console.log('Match update received:', payload);
          refreshMatches();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'predictions' },
        () => {
          refreshPredictions();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stages' },
        () => {
          refreshStages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groups, tournament]); // Re-subscribe if groups or tournament change

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
    
    const qualified: Record<string, Team> = {};
    const stage1 = stages.find(s => s.name === '第一阶段');
    if (!stage1) return qualified;
    
    const stage1Groups = groups.filter(g => g.stage_id === stage1.id);
    
    stage1Groups.forEach(group => {
       const groupMatches = matches
         .filter(m => m.group_id === group.id)
         .sort((a, b) => a.id.localeCompare(b.id));

       // Assuming match order: M0, M1, M2(WF), M3(LR1), M4(LF)
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

  const isStageLocked = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return false;
    
    // Check deadline
    if (stage.deadline) {
      const deadline = new Date(stage.deadline);
      const now = new Date();
      return now > deadline;
    }
    
    return false;
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
      currentUser,
      isStageLocked
    }}>
      {children}
    </TournamentContext.Provider>
  );
};
