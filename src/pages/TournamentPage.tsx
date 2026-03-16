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
import { ToggleLeft, ToggleRight, Lock } from 'lucide-react';
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
    getQualifiedTeams,
    isStageLocked
  } = useTournament();

  const [showActualResults, setShowActualResults] = useState(false);
  const navigate = useNavigate();

  const currentStage = stages.find(s => s.id === currentStageId);
  const currentGroups = groups.filter(g => g.stage_id === currentStageId);
  // Filter matches for current groups
  const currentMatches = matches.filter(m => currentGroups.some(g => g.id === m.group_id));

  // Get Qualified Teams map for Stage 2
  const qualifiedTeams = getQualifiedTeams();
  
  const isLocked = currentStageId ? isStageLocked(currentStageId) : false;
  
  // Get deadline for current stage for timer
  const currentStageDeadline = currentStage?.deadline ? new Date(currentStage.deadline) : null;
  // If no deadline set in DB, fallback to hardcoded (March 17)
  const defaultTargetDate = new Date(new Date().getFullYear(), 2, 17);
  const targetDate = currentStageDeadline || defaultTargetDate;
  
  const handleSave = () => {
    if (isLocked) {
      alert('本阶段预测已锁定，无法修改。');
      return;
    }
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
          <div className="flex justify-between items-center mb-6 px-8">
             <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">显示实际赛果</span>
                <button 
                  onClick={() => setShowActualResults(!showActualResults)}
                  className="focus:outline-none"
                >
                  {showActualResults ? (
                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-500" />
                  )}
                </button>
             </div>
             
             {isLocked && (
               <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-3 py-1 rounded-full border border-red-500/20">
                 <Lock className="w-4 h-4" />
                 <span className="text-sm font-bold">本阶段预测已锁定</span>
               </div>
             )}
          </div>

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
                showActualResults={showActualResults}
                isLocked={isLocked}
              />
            ) : (
              <GroupStage 
                groups={currentGroups}
                matches={currentMatches}
                predictions={predictions}
                teams={teams}
                onPredict={updatePrediction}
                onClear={clearPrediction}
                showActualResults={showActualResults}
                isLocked={isLocked}
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
