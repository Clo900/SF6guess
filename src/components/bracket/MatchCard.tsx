import React from 'react';
import { clsx } from 'clsx';
import type { Match, Team, Prediction } from '@/types';
import { Card } from '../ui/Card';
import { TeamSlot } from './TeamSlot';

interface MatchCardProps {
  match: Match;
  team1?: Team;
  team2?: Team;
  prediction?: Prediction;
  onPredict?: (matchId: string, teamId: string, score: string) => void;
  onClear?: (matchId: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, team1, team2, prediction, onPredict, onClear }) => {
  const predictedWinnerId = prediction?.predicted_winner_id;
  
  // Show all score options for Best of 3
  // Team 1 wins: 2:0, 2:1
  // Team 2 wins: 0:2, 1:2
  const scoreOptions = ['2:0', '2:1', '1:2', '0:2'];

  const handleScoreSelect = (score: string) => {
    if (!onPredict) return;
    
    // Infer winner from score
    const [s1, s2] = score.split(':').map(Number);
    let winnerId = '';
    
    if (s1 > s2) {
      if (team1) winnerId = team1.id;
    } else {
      if (team2) winnerId = team2.id;
    }
    
    if (winnerId) {
      onPredict(match.id, winnerId, score);
    }
  };

  const handleTeamClick = (teamId: string) => {
    if (!onPredict) return;
    
    const isTeam1 = teamId === team1?.id;
    // If clicking team, set default score if none selected or if switching winner
    // Default: 2:0 or 0:2
    
    if (predictedWinnerId !== teamId) {
       const defaultScore = isTeam1 ? '2:0' : '0:2';
       onPredict(match.id, teamId, defaultScore);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClear) {
      onClear(match.id);
    }
  };

  return (
    <Card className="w-64 flex flex-col gap-2 p-3 bg-slate-800/80 border-slate-700">
      <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
        <span>对阵</span>
        {prediction && (
          <span className={clsx(
            prediction.is_correct === true && "text-emerald-400",
            prediction.is_correct === false && "text-red-400"
          )}>
            {prediction.is_correct ? '+5' : ''}
            {prediction.predicted_score === match.score && match.score ? ' +10' : ''}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <TeamSlot 
          id={`slot-${match.id}-1`}
          matchId={match.id} // Keep for logic if needed
          team={team1}
          isWinner={prediction?.predicted_winner_id === team1?.id}
          onClick={() => team1 && handleTeamClick(team1.id)}
          onContextMenu={handleContextMenu}
        />
        <div className="flex items-center justify-center text-xs text-gray-500 font-mono">VS</div>
        <TeamSlot 
          id={`slot-${match.id}-2`}
          matchId={match.id}
          team={team2}
          isWinner={prediction?.predicted_winner_id === team2?.id}
          onClick={() => team2 && handleTeamClick(team2.id)}
          onContextMenu={handleContextMenu}
        />
      </div>

      {/* Score Section */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        {/* Prediction Score Selector */}
        <div className="flex flex-col gap-1">
           <span className="text-[10px] text-gray-500 text-center">竞猜比分</span>
           <div className="grid grid-cols-2 gap-1 justify-center">
             {(team1 && team2) ? (
               scoreOptions.map(score => (
                 <button
                   key={score}
                   onClick={() => handleScoreSelect(score)}
                   className={clsx(
                     "px-1 py-1 text-[10px] rounded border transition-colors text-center",
                     prediction?.predicted_score === score
                       ? "bg-emerald-600 border-emerald-500 text-white"
                       : "bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600"
                   )}
                 >
                   {score}
                 </button>
               ))
             ) : (
               <span className="text-xs text-gray-600 py-1 col-span-2 text-center">等待选手</span>
             )}
           </div>
        </div>

        {/* Actual Score Display */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-500 text-center">实际比分</span>
          <div className="flex justify-center items-center h-full">
            <span className={clsx(
              "text-sm font-mono font-bold",
              match.score ? "text-white" : "text-gray-500"
            )}>
              {match.score || "?:?"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
