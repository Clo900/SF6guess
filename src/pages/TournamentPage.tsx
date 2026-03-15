import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Header } from '@/components/layout/Header';
import { Leaderboard } from '@/components/layout/Leaderboard';
import { GroupStage } from '@/components/bracket/GroupStage';
import { SeedChallengeStage } from '@/components/bracket/SeedChallengeStage';
import { useTournament } from '@/components/providers/TournamentProvider';
import { Button } from '@/components/ui/Button';
import { Check, LogIn, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Timer } from '@/components/ui/Timer';

export const TournamentPage: React.FC = () => {
  const { 
    stages, 
    groups, 
    matches, 
    teams, 
    predictions, 
    updatePrediction, 
    clearPrediction,
    savePredictions,
    leaderboard,
    tournament,
    loading,
    currentUser,
    currentStageId,
    setCurrentStageId,
    getQualifiedTeams
  } = useTournament();

  const navigate = useNavigate();

  const currentStage = stages.find(s => s.id === currentStageId);
  const currentGroups = groups.filter(g => g.stage_id === currentStageId);
  // Filter matches for current groups
  const currentMatches = matches.filter(m => currentGroups.some(g => g.id === m.group_id));

  // Get Qualified Teams map for Stage 2
  const qualifiedTeams = getQualifiedTeams();
  
  const handleSave = () => {
    if (!currentUser) {
      navigate('/auth');
    } else {
      savePredictions();
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('sf6guess_user');
    window.location.reload();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen text-white">
          Loading...
        </div>
      </Layout>
    );
  }

  // Target date for countdown: March 17th of the current year (or next year if passed)
  const getTargetDate = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    let target = new Date(currentYear, 2, 17); // Month is 0-indexed: 2 is March
    
    // If March 17th has passed this year, use next year (optional logic, but usually for upcoming events)
    // For now, let's assume it's for the upcoming event. 
    // If today is March 18th 2026, setting it to March 17th 2026 will show "Expired".
    // If the user meant "March 17th" specifically relative to "now", we just use that date object.
    
    // Since env says today is 2026-03-15, March 17 2026 is in the future.
    return target;
  };

  const targetDate = getTargetDate();

  return (
    <Layout>
      <div className="relative">
        <Header 
          stages={stages} 
          currentStageId={currentStageId} 
          onStageChange={setCurrentStageId}
        />
        <div className="absolute top-6 right-6 z-20">
          {currentUser ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-emerald-400">
                Welcome, {currentUser.nickname || currentUser.username}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" /> 退出
              </Button>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => navigate('/auth')}>
              <LogIn className="w-4 h-4 mr-1" /> 登录
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden relative">
        
        <main className="flex-1 overflow-auto bg-slate-900/30 p-8 relative scrollbar-thin scrollbar-thumb-emerald-900/50">
          <div className="min-w-fit pb-20">
            {currentStage?.name === '第二阶段' ? (
              <SeedChallengeStage
                groups={currentGroups}
                matches={currentMatches}
                predictions={predictions}
                teams={teams}
                qualifiedTeams={qualifiedTeams}
                onPredict={updatePrediction}
                onClear={clearPrediction}
              />
            ) : (
              <GroupStage 
                groups={currentGroups}
                matches={currentMatches}
                predictions={predictions}
                teams={teams}
                onPredict={updatePrediction}
                onClear={clearPrediction}
              />
            )}
          </div>
        </main>
        
        <div className="flex flex-col h-full relative z-10 w-72 bg-slate-900/80 border-l border-white/5">
           {/* Countdown Timer above Leaderboard */}
           <div className="p-4 border-b border-white/5 flex justify-center">
              <Timer targetDate={targetDate} />
           </div>
           <Leaderboard entries={leaderboard} />
        </div>

        <div className="absolute bottom-8 right-8 z-20">
          <Button 
            size="lg" 
            className="rounded-full shadow-2xl shadow-emerald-900/50 flex items-center gap-2 pr-6"
            onClick={handleSave}
          >
            <div className="bg-white/20 rounded-full p-1">
              <Check className="w-5 h-5" />
            </div>
            {currentUser ? '选择已保存' : '登录并保存'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};
