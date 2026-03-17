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
        // Filter and sort matches for this group
        // Assuming ID order is correct for bracket progression (M1, M2, M3, M4, M5)
        const groupMatches = matches
            .filter(m => m.group_id === group.id)
            .sort((a, b) => a.id.localeCompare(b.id));

        // Logic to determine participants for each match based on mode
        const getMatchParticipants = (matchIndex: number) => {
          const match = groupMatches[matchIndex];
          if (!match) return { team1: undefined, team2: undefined };

          // If showing actual results, use the DB data directly
          if (showActualResults) {
             return {
               team1: teams.find(t => t.id === match.team1_id),
               team2: teams.find(t => t.id === match.team2_id)
             };
          }

          // If prediction mode, we need to SIMULATE the bracket flow based on PREDICTIONS
          // Match 0 & 1 are fixed (Round 1)
          if (matchIndex === 0 || matchIndex === 1) {
             return {
               team1: teams.find(t => t.id === match.team1_id),
               team2: teams.find(t => t.id === match.team2_id)
             };
          }

          // For Match 2 (Winner's Final), Match 3 (Loser's R1), Match 4 (Loser's Final)
          // We need to look at previous matches in the sequence
          
          const m0 = groupMatches[0];
          const m1 = groupMatches[1];
          const m2 = groupMatches[2]; // WF
          const m3 = groupMatches[3]; // LR1
          
          const getPredictedWinnerOfMatch = (m?: Match) => {
             if (!m) return undefined;
             const p = predictions[m.id];
             return p?.predicted_winner_id ? teams.find(t => t.id === p.predicted_winner_id) : undefined;
          };

          const getPredictedLoserOfMatch = (m?: Match) => {
             if (!m) return undefined;
             const p = predictions[m.id];
             if (!p?.predicted_winner_id) return undefined;
             return m.team1_id === p.predicted_winner_id 
                ? teams.find(t => t.id === m.team2_id) 
                : teams.find(t => t.id === m.team1_id);
          };

          // Simulation
          const w0 = getPredictedWinnerOfMatch(m0);
          const w1 = getPredictedWinnerOfMatch(m1);
          const l0 = getPredictedLoserOfMatch(m0);
          const l1 = getPredictedLoserOfMatch(m1);

          // Match 2 (Winner's Final): Winner of M0 vs Winner of M1
          if (matchIndex === 2) {
             return { team1: w0, team2: w1 };
          }

          // Match 3 (Loser's R1): Loser of M0 vs Loser of M1
          if (matchIndex === 3) {
             return { team1: l0, team2: l1 };
          }

          // Match 4 (Loser's Final): Loser of M2 vs Winner of M3
          if (matchIndex === 4) {
             // We need derived participants of M2 and M3
             const m2_participants = { team1: w0, team2: w1 };
             const m3_participants = { team1: l0, team2: l1 };
             
             const getPredictedLoserOfDerivedMatch = (m: Match, p1?: Team, p2?: Team) => {
                const p = predictions[m.id];
                if (!p?.predicted_winner_id) return undefined;
                if (p.predicted_winner_id === p1?.id) return p2;
                if (p.predicted_winner_id === p2?.id) return p1;
                return undefined;
             };
             
             const getPredictedWinnerOfDerivedMatch = (m: Match, p1?: Team, p2?: Team) => {
                const p = predictions[m.id];
                if (!p?.predicted_winner_id) return undefined;
                return teams.find(t => t.id === p.predicted_winner_id);
             };

             const l2 = getPredictedLoserOfDerivedMatch(m2, m2_participants.team1, m2_participants.team2);
             const w3 = getPredictedWinnerOfDerivedMatch(m3, m3_participants.team1, m3_participants.team2);
             
             return { team1: l2, team2: w3 };
          }

          return { team1: undefined, team2: undefined };
        };

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
                          team1={getMatchParticipants(0).team1}
                          team2={getMatchParticipants(0).team2}
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
                          team1={getMatchParticipants(1).team1}
                          team2={getMatchParticipants(1).team2}
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
                        team1={getMatchParticipants(2).team1}
                        team2={getMatchParticipants(2).team2}
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
                        team1={getMatchParticipants(3).team1}
                        team2={getMatchParticipants(3).team2}
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
                        team1={getMatchParticipants(4).team1}
                        team2={getMatchParticipants(4).team2}
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
