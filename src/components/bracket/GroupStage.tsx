import React from 'react';
import { MatchCard } from './MatchCard';
import { TeamSlot } from './TeamSlot';
import type { Group, Match, Prediction, Team } from '@/types';
import { ArrowRight, ArrowDownRight, ArrowUpRight, ArrowDown, XCircle } from 'lucide-react';

interface GroupStageProps {
  groups: Group[];
  matches: Match[];
  predictions: Record<string, Prediction>;
  teams: Team[];
  onPredict: (matchId: string, teamId: string, score: string) => void;
  onClear?: (matchId: string) => void;
  showActualResults?: boolean;
  isLocked?: boolean;
}

export const GroupStage: React.FC<GroupStageProps> = ({ 
  groups, 
  matches, 
  predictions, 
  teams, 
  onPredict, 
  onClear,
  showActualResults = false,
  isLocked = false
}) => {
  return (
    <div className="flex flex-col gap-16 p-8 overflow-x-auto min-w-full pb-12">
      {groups.map((group) => {
        const groupMatches = matches.filter(m => m.group_id === group.id);
        
        // Helper to get predicted winner team
        const getPredictedWinner = (matchIndex: number) => {
          const match = groupMatches[matchIndex];
          if (!match) return undefined;
          
          if (showActualResults) {
             return match.winner_id ? teams.find(t => t.id === match.winner_id) : undefined;
          }

          const prediction = predictions[match.id];
          if (!prediction?.predicted_winner_id) return undefined;
          return teams.find(t => t.id === prediction.predicted_winner_id);
        };

        const qualified1 = getPredictedWinner(2); // Winner's Final Winner
        const qualified2 = getPredictedWinner(4); // Loser's Final Winner

        return (
          <div key={group.id} className="flex flex-col gap-6 min-w-max border-b border-white/5 pb-12 last:border-0 relative">
            <h2 className="text-3xl font-bold text-blue-400 pl-4 border-l-4 border-blue-500">{group.name}</h2>
            
            {/* Container with custom gaps between columns */}
            <div className="flex items-stretch pt-4 relative min-h-[500px]">
              
              {/* Column 1: Round 1 */}
              <div className="flex flex-col justify-center gap-12 relative z-10 mr-24">
                <div className="flex flex-col gap-2">
                  <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">首轮 (Round 1)</div>
                  <div className="flex flex-col gap-12">
                    {/* Match 1 */}
                    <div className="relative">
                      {groupMatches[0] && (
                        <MatchCard
                          match={groupMatches[0]}
                          team1={teams.find(t => t.id === groupMatches[0].team1_id)}
                          team2={teams.find(t => t.id === groupMatches[0].team2_id)}
                          prediction={predictions[groupMatches[0].id]}
                          onPredict={onPredict}
                          onClear={onClear}
                          showActualResults={showActualResults}
                          isLocked={isLocked}
                        />
                      )}
                      {/* Arrows */}
                      <div className="absolute top-4 -right-8 flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-emerald-500 font-bold">胜</span>
                          <ArrowRight className="w-5 h-5 text-emerald-500" />
                        </div>
                      </div>
                      <div className="absolute bottom-4 -right-8 flex flex-col items-center gap-1">
                         <div className="flex items-center gap-1">
                          <span className="text-[10px] text-red-500 font-bold">负</span>
                          <ArrowDownRight className="w-5 h-5 text-red-500" />
                        </div>
                      </div>
                    </div>

                    {/* Match 2 */}
                    <div className="relative">
                      {groupMatches[1] && (
                        <MatchCard
                          match={groupMatches[1]}
                          team1={teams.find(t => t.id === groupMatches[1].team1_id)}
                          team2={teams.find(t => t.id === groupMatches[1].team2_id)}
                          prediction={predictions[groupMatches[1].id]}
                          onPredict={onPredict}
                          onClear={onClear}
                          showActualResults={showActualResults}
                          isLocked={isLocked}
                        />
                      )}
                       {/* Arrows */}
                       <div className="absolute top-4 -right-8 flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-emerald-500 font-bold">胜</span>
                          <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                        </div>
                      </div>
                      <div className="absolute bottom-4 -right-8 flex flex-col items-center gap-1">
                         <div className="flex items-center gap-1">
                          <span className="text-[10px] text-red-500 font-bold">负</span>
                          <ArrowDownRight className="w-5 h-5 text-red-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Winner's Final & Loser's R1 */}
              <div className="flex flex-col justify-between relative z-10 mr-16">
                 {/* Winner's Final */}
                 <div className="flex flex-col gap-2 relative">
                    <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">胜者组决赛</div>
                    {groupMatches[2] && (
                      <MatchCard
                        match={groupMatches[2]}
                        team1={teams.find(t => t.id === groupMatches[2].team1_id)}
                        team2={teams.find(t => t.id === groupMatches[2].team2_id)}
                        prediction={predictions[groupMatches[2].id]}
                        onPredict={onPredict}
                        onClear={onClear}
                        showActualResults={showActualResults}
                        isLocked={isLocked}
                      />
                    )}
                    {/* Arrows */}
                    <div className="absolute top-1/2 -right-8 -translate-y-1/2 flex flex-col gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-emerald-500 font-bold">晋级</span>
                        <ArrowRight className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-red-500 font-bold">负</span>
                        <ArrowDown className="w-5 h-5 text-red-500" />
                      </div>
                    </div>
                 </div>
                 
                 {/* Loser's Round 1 */}
                 <div className="flex flex-col gap-2 relative pb-2">
                    <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">败者组第一轮</div>
                    {groupMatches[3] && (
                      <MatchCard
                        match={groupMatches[3]}
                        team1={teams.find(t => t.id === groupMatches[3].team1_id)}
                        team2={teams.find(t => t.id === groupMatches[3].team2_id)}
                        prediction={predictions[groupMatches[3].id]}
                        onPredict={onPredict}
                        onClear={onClear}
                        showActualResults={showActualResults}
                        isLocked={isLocked}
                      />
                    )}
                    {/* Arrows */}
                    <div className="absolute top-1/2 -right-8 -translate-y-1/2 flex flex-col gap-4">
                      <div className="flex items-center gap-1">
                         <span className="text-[10px] text-emerald-500 font-bold">胜</span>
                         <ArrowRight className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="flex items-center gap-1">
                         <span className="text-[10px] text-red-500 font-bold">淘汰</span>
                         <XCircle className="w-5 h-5 text-red-500" />
                      </div>
                    </div>
                 </div>
              </div>

              {/* Column 3: Qualified 1 & Loser's Final */}
              <div className="flex flex-col justify-between relative z-10 mr-16">
                 {/* Qualified 1 (Winner of Winner's Final) */}
                 <div className="flex flex-col gap-2 relative">
                   <div className="h-[26px]"></div> {/* Spacer to align with MatchCard header */}
                   <div className="flex flex-col items-center justify-center w-64 h-32 border border-emerald-500/50 rounded bg-emerald-900/20 shadow-[0_0_20px_rgba(16,185,129,0.3)] relative p-4 gap-2">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2">
                         <ArrowRight className="w-5 h-5 text-emerald-500" />
                      </div>
                      <span className="text-emerald-400 font-bold text-xl">{group.name}第一</span>
                      <TeamSlot 
                        id={`qualified-1-${group.id}`}
                        team={qualified1}
                        isWinner={true}
                        className="w-full"
                        placeholder="待定"
                      />
                      <span className="text-sm text-emerald-600">直接晋级</span>
                   </div>
                 </div>

                 {/* Loser's Final (Decider) */}
                 <div className="flex flex-col gap-2 relative pb-2">
                    <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">败者组决赛 (Decider)</div>
                    {groupMatches[4] && (
                      <MatchCard
                        match={groupMatches[4]}
                        team1={teams.find(t => t.id === groupMatches[4].team1_id)}
                        team2={teams.find(t => t.id === groupMatches[4].team2_id)}
                        prediction={predictions[groupMatches[4].id]}
                        onPredict={onPredict}
                        onClear={onClear}
                        showActualResults={showActualResults}
                        isLocked={isLocked}
                      />
                    )}
                    {/* Arrows */}
                    <div className="absolute top-1/2 -right-8 -translate-y-1/2 flex flex-col gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-emerald-500 font-bold">晋级</span>
                        <ArrowRight className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-red-500 font-bold">淘汰</span>
                        <XCircle className="w-5 h-5 text-red-500" />
                      </div>
                    </div>
                 </div>
              </div>
              
              {/* Column 4: Qualified 2 */}
              <div className="flex flex-col justify-end relative z-10 pb-2">
                 {/* Qualified 2 */}
                 <div className="flex flex-col gap-2">
                   <div className="h-[26px]"></div>
                   <div className="flex flex-col items-center justify-center w-64 h-32 border border-emerald-500/50 rounded bg-emerald-900/20 shadow-[0_0_20px_rgba(16,185,129,0.3)] relative p-4 gap-2">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2">
                         <ArrowRight className="w-5 h-5 text-emerald-500" />
                      </div>
                      <span className="text-emerald-400 font-bold text-xl">{group.name}第二</span>
                      <TeamSlot 
                        id={`qualified-2-${group.id}`}
                        team={qualified2}
                        isWinner={true}
                        className="w-full"
                        placeholder="待定"
                      />
                      <span className="text-sm text-emerald-600">败者组晋级</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
