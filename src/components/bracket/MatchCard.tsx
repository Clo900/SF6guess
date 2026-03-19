import React from 'react';
import { clsx } from 'clsx';
import type { Match, Team, Prediction } from '@/types';
import { TeamSlot } from './TeamSlot';

interface MatchCardProps {
  match: Match;
  team1?: Team;
  team2?: Team;
  prediction?: Prediction;
  onPredict?: (matchId: string, teamId: string, score: string) => void;
  onClear?: (matchId: string) => void;
  format?: 'FT2' | 'FT3' | 'FT4';
  showActualResults?: boolean;
  isLocked?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  team1, 
  team2, 
  prediction, 
  onPredict, 
  onClear,
  format = 'FT2',
  showActualResults = false,
  isLocked = false
}) => {
  const isFT4 = format === 'FT4';
  const isFT3 = format === 'FT3';
  const scoreOptions = isFT4 
    ? ['4:0', '4:1', '4:2', '4:3', '3:4', '2:4', '1:4', '0:4']
    : isFT3
    ? ['3:0', '3:1', '3:2', '2:3', '1:3', '0:3']
    : ['2:0', '2:1', '1:2', '0:2'];

  const handleScoreSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isLocked) return;
    const score = e.target.value;
    if (!onPredict) return;
    
    // Infer winner from score
    const [s1, s2] = score.split(':').map(Number);
    let winnerId = '';
    
    if (s1 > s2) {
      if (team1) winnerId = team1.id;
    } else if (s2 > s1) {
      if (team2) winnerId = team2.id;
    }
    
    if (winnerId) {
      onPredict(match.id, winnerId, score);
    }
  };

  const handleScoreClick = (score: string) => {
    if (isLocked) return;
    if (!onPredict) return;
    
    // Infer winner from score
    const [s1, s2] = score.split(':').map(Number);
    let winnerId = '';
    
    if (s1 > s2) {
      if (team1) winnerId = team1.id;
    } else if (s2 > s1) {
      if (team2) winnerId = team2.id;
    }
    
    if (winnerId) {
      onPredict(match.id, winnerId, score);
    }
  };

  const handleTeamClick = (teamId: string) => {
    // If user clicks a team, we can set a default score? 
    // Or just highlight?
    // Current requirement seems to rely on Score buttons to set prediction.
    // So team click might be for info or just selecting winner without score?
    // But schema requires score.
    // Let's assume default score based on format.
    if (isLocked) return;
    if (!onPredict) return;
    
    // Default score: 2:0 or 0:2
    // If team1 clicked -> 2:0
    // If team2 clicked -> 0:2
    // For FT4: 4:0 / 0:4
    
    let score = '0:0';
    if (team1 && teamId === team1.id) {
       score = isFT4 ? '4:0' : isFT3 ? '3:0' : '2:0';
    } else if (team2 && teamId === team2.id) {
       score = isFT4 ? '0:4' : isFT3 ? '0:3' : '0:2';
    }
    
    onPredict(match.id, teamId, score);
  };
  
  // Determine what to display based on mode
  const displayScore = showActualResults ? match.score : prediction?.predicted_score;
  const displayWinnerId = showActualResults ? match.winner_id : prediction?.predicted_winner_id;
  
  // Determine if correct (only in prediction mode when actual result exists)
  const isCorrectWinner = !showActualResults && match.winner_id && prediction?.predicted_winner_id === match.winner_id;
  const isCorrectScore = !showActualResults && match.score && prediction?.predicted_score === match.score;

  // Determine styles
  const getTeamStyle = (team?: Team) => {
    if (!team) return "border-slate-700 opacity-50";
    
    if (showActualResults) {
        if (match.winner_id === team.id) return "border-yellow-500 bg-yellow-900/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]";
        if (match.winner_id && match.winner_id !== team.id) return "border-slate-700 opacity-50 grayscale";
        return "border-slate-600";
    } else {
        if (displayWinnerId === team.id) {
            let style = "border-emerald-500 bg-emerald-900/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
            if (isCorrectWinner) style += " ring-1 ring-yellow-400";
            return style;
        }
        return isLocked ? "border-slate-700" : "border-slate-600 hover:border-emerald-500/50";
    }
  };

  return (
    <div className={clsx(
        "flex flex-col gap-2 w-64 bg-slate-800/80 border border-slate-700 p-3 rounded-lg relative transition-all duration-300",
        isLocked && !showActualResults && "opacity-90 grayscale-[0.3]"
    )}>
      {/* Header / Status */}
      <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
        <span>{match.scheduled_at ? new Date(match.scheduled_at).toLocaleDateString() : 'TBD'}</span>
        {showActualResults ? (
            <span className={match.winner_id ? "text-yellow-500" : "text-gray-500"}>
                {match.winner_id ? "已完赛" : "未开始"}
            </span>
        ) : (
            <span className={prediction ? "text-emerald-400" : "text-gray-500"}>
                {isLocked ? (prediction ? "已锁定" : "已截止") : (prediction ? "已预测" : "未预测")}
            </span>
        )}
      </div>

      {/* Team 1 */}
      <div 
        className={clsx(
            "flex items-center gap-3 p-2 rounded border transition-all cursor-pointer", 
            getTeamStyle(team1),
            (isLocked || showActualResults) && "cursor-default"
        )}
        onClick={() => !showActualResults && !isLocked && team1 && handleTeamClick(team1.id)}
      >
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
            {team1?.logo_url ? (
                <img src={team1.logo_url} alt={team1.name} className="w-full h-full object-cover" />
            ) : (
                <span className="text-[10px] font-bold text-gray-400">{team1?.name?.substring(0, 2) || '?'}</span>
            )}
        </div>
        <span className={clsx("text-sm font-bold truncate flex-1", !team1 && "text-gray-600")}>
            {team1?.name || '待定'}
        </span>
        {showActualResults && match.score && (
            <span className="text-lg font-bold font-mono text-yellow-500">{match.score.split(':')[0]}</span>
        )}
      </div>

      {/* VS / Score Input */}
      <div className="flex justify-center py-1">
          {showActualResults ? (
             <div className="text-xs text-gray-500 font-mono">
                VS
             </div>
          ) : (
             <>
                {isFT4 || isFT3 ? (
                    <select
                    value={displayScore || ''}
                    onChange={handleScoreSelect}
                    disabled={!team1 || !team2 || isLocked}
                    className={clsx(
                        "w-full px-2 py-1 text-xs rounded border transition-colors text-center cursor-pointer",
                        displayScore
                        ? "bg-emerald-600 border-emerald-500 text-white font-bold"
                        : "bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600",
                        isLocked && "opacity-70 cursor-not-allowed hover:bg-slate-700"
                    )}
                    >
                    <option value="" disabled>选择比分</option>
                    {scoreOptions.map(score => (
                        <option key={score} value={score} className="bg-slate-800 text-gray-300">
                        {score}
                        </option>
                    ))}
                    </select>
                ) : (
                    <div className="grid grid-cols-2 gap-1 justify-center">
                    {(team1 && team2) ? (
                        scoreOptions.map(score => (
                        <button
                            key={score}
                            onClick={() => handleScoreClick(score)}
                            disabled={isLocked}
                            className={clsx(
                            "px-1 py-1 text-[10px] rounded border transition-colors text-center",
                            displayScore === score
                                ? "bg-emerald-600 border-emerald-500 text-white"
                                : "bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600",
                            isLocked && "opacity-70 cursor-not-allowed hover:bg-slate-700"
                            )}
                        >
                            {score}
                        </button>
                        ))
                    ) : (
                        <span className="text-xs text-gray-600 py-1 col-span-2 text-center">等待选手</span>
                    )}
                    </div>
                )}
             </>
          )}
      </div>

      {/* Team 2 */}
      <div 
        className={clsx(
            "flex items-center gap-3 p-2 rounded border transition-all cursor-pointer", 
            getTeamStyle(team2),
            (isLocked || showActualResults) && "cursor-default"
        )}
        onClick={() => !showActualResults && !isLocked && team2 && handleTeamClick(team2.id)}
      >
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
            {team2?.logo_url ? (
                <img src={team2.logo_url} alt={team2.name} className="w-full h-full object-cover" />
            ) : (
                <span className="text-[10px] font-bold text-gray-400">{team2?.name?.substring(0, 2) || '?'}</span>
            )}
        </div>
        <span className={clsx("text-sm font-bold truncate flex-1", !team2 && "text-gray-600")}>
            {team2?.name || '待定'}
        </span>
        {showActualResults && match.score && (
            <span className="text-lg font-bold font-mono text-yellow-500">{match.score.split(':')[1]}</span>
        )}
      </div>
      
      {/* Result Indicator (Correct/Incorrect) */}
      {!showActualResults && prediction && match.winner_id && (
          <div className="absolute -top-2 -right-2 bg-slate-900 rounded-full p-1 border border-slate-700 shadow-lg z-20">
              {isCorrectWinner ? (
                  isCorrectScore ? (
                    <span className="text-xs font-bold text-yellow-400 px-1">PERFECT</span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 px-1">WIN</span>
                  )
              ) : (
                  <span className="text-xs font-bold text-red-500 px-1">LOSS</span>
              )}
          </div>
      )}
    </div>
  );
};
