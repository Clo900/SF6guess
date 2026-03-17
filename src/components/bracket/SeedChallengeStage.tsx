import React from 'react';
import { MatchCard } from './MatchCard';
import type { Group, Match, Prediction, Team } from '@/types';
import { ArrowRight } from 'lucide-react';

interface SeedChallengeStageProps {
  groups: Group[];
  matches: Match[];
  predictions: Record<string, Prediction>;
  teams: Team[];
  qualifiedTeams?: Record<string, Team>;
  onPredict: (matchId: string, teamId: string, score: string) => void;
  onClear?: (matchId: string) => void;
  showActualResults?: boolean;
  isLocked?: boolean;
}

export const SeedChallengeStage: React.FC<SeedChallengeStageProps> = ({ 
  groups, 
  matches, 
  predictions, 
  teams, 
  qualifiedTeams = {}, 
  onPredict, 
  onClear,
  showActualResults = false,
  isLocked = false
}) => {
  // Groups are E, F, G, H
  // Each group has 2 matches.
  // Match 1: Qualifier (e.g. B1 vs C2)
  // Match 2: Seed Challenge (Winner vs Seed)

  // Helper to get predicted winner team
  const getPredictedWinner = (match: Match | undefined) => {
    if (!match) return undefined;
    
    if (showActualResults) {
        return match.winner_id ? teams.find(t => t.id === match.winner_id) : undefined;
    }

    const prediction = predictions[match.id];
    
    // If prediction exists, use it
    if (prediction?.predicted_winner_id) {
        const team = teams.find(t => t.id === prediction.predicted_winner_id);
        if (team && qualifiedTeams[team.name]) {
            return qualifiedTeams[team.name];
        }
        return team;
    }
    
    // If NO prediction, but the match has a real winner (completed), return it
    if (match.winner_id) {
        return teams.find(t => t.id === match.winner_id);
    }

    return undefined;
  };

  return (
    <div className="flex justify-center p-8 min-w-full pb-12">
      <div className="flex gap-8 relative">
        {/* Left Column: Qualifiers (Round 1) */}
        <div className="flex flex-col gap-4">
          <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2 text-center">首轮</div>
          {groups.map((group) => {
            const groupMatches = matches.filter(m => m.group_id === group.id);
            
            // Identify matches based on Seed Teams
            // Seed Match has one of the fixed seed players.
            // Qualifier Match does not.
            const seedTeamNames = ['鲤鱼饭', '秀太', '香蕉', '普鲁托'];
            
            const seedMatch = groupMatches.find(m => {
              const t1 = teams.find(t => t.id === m.team1_id);
              const t2 = teams.find(t => t.id === m.team2_id);
              return (t1 && seedTeamNames.includes(t1.name)) || (t2 && seedTeamNames.includes(t2.name));
            });
            
            const qualifierMatch = groupMatches.find(m => m.id !== seedMatch?.id);
            
            // Resolve placeholder teams for Qualifier Match
            // Match has team1 and team2 which are placeholders in DB (e.g. "B组第一")
            // We need to check if we have a qualified team for that placeholder.
            
            const getResolvedTeam = (teamId?: string) => {
               const placeholderTeam = teams.find(t => t.id === teamId);
               if (!placeholderTeam) return undefined;
               
               // Check if we have a qualified team mapping
               // The placeholder name (e.g. "B组第一") is the key
               return qualifiedTeams[placeholderTeam.name] || placeholderTeam;
            };

            const qTeam1 = getResolvedTeam(qualifierMatch?.team1_id);
            const qTeam2 = getResolvedTeam(qualifierMatch?.team2_id);

            return (
              <div key={`qualifier-${group.id}`} className="relative">
                {qualifierMatch && (
                  <MatchCard
                    match={qualifierMatch}
                    team1={qTeam1}
                    team2={qTeam2}
                    prediction={predictions[qualifierMatch.id]}
                    onPredict={onPredict}
                    onClear={onClear}
                    format="FT4"
                    showActualResults={showActualResults}
                    isLocked={isLocked}
                  />
                )}
                {/* Arrow to middle */}
              </div>
            );
          })}
        </div>

        {/* Middle Column: Arrows */}
        <div className="flex flex-col gap-4 pt-8">
           {groups.map((group) => (
              <div key={`arrow-${group.id}`} className="flex items-center justify-center h-[230px] px-4"> 
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-emerald-500 font-bold">晋级</span>
                    <ArrowRight className="w-8 h-8 text-emerald-500" />
                  </div>
              </div>
           ))}
        </div>

        {/* Right Column: Seed Challenges (Round 2) */}
        <div className="flex flex-col gap-4">
          <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2 text-center">次轮</div>
          {groups.map((group) => {
            const groupMatches = matches.filter(m => m.group_id === group.id);
            
            const seedTeamNames = ['鲤鱼饭', '秀太', '香蕉', '普鲁托'];
            
            const seedMatch = groupMatches.find(m => {
              const t1 = teams.find(t => t.id === m.team1_id);
              const t2 = teams.find(t => t.id === m.team2_id);
              return (t1 && seedTeamNames.includes(t1.name)) || (t2 && seedTeamNames.includes(t2.name));
            });
            
            const qualifierMatch = groupMatches.find(m => m.id !== seedMatch?.id);

            // Determine Winner of Qualifier to show in Seed Match
            const qualifierWinner = getPredictedWinner(qualifierMatch);

            // Determine Winner of Seed Match (Group Winner)
            const groupWinner = getPredictedWinner(seedMatch);
            
            return (
              <div key={`seed-${group.id}`} className="relative flex items-center gap-2">
                {seedMatch && (
                  <MatchCard
                    match={seedMatch}
                    team1={qualifierWinner || teams.find(t => t.id === seedMatch.team1_id)} // Fallback to DB if set later
                    team2={teams.find(t => t.id === seedMatch.team2_id)}
                    prediction={predictions[seedMatch.id]}
                    onPredict={onPredict}
                    onClear={onClear}
                    format="FT4"
                    showActualResults={showActualResults}
                    isLocked={isLocked}
                  />
                )}
                {/* Group Label */}
                <div className="flex items-center justify-center w-8 h-full min-h-[64px] rounded bg-blue-900/30 border border-blue-500/30 text-blue-400 font-bold writing-vertical-rl text-xs py-2 ml-2 self-stretch">
                  {group.name}
                </div>
                
                {/* Arrow to Group Winner */}
                <div className="flex flex-col items-center justify-center px-2">
                  <ArrowRight className="w-5 h-5 text-emerald-500" />
                </div>

                {/* Group Winner Slot */}
                <div className="flex flex-col items-center justify-center w-32 h-[100px] bg-slate-800/80 border border-slate-700 rounded p-2">
                    <span className="text-[10px] text-gray-400 mb-2">晋级</span>
                    {groupWinner ? (
                        <div className="flex flex-col items-center gap-1">
                            {groupWinner.logo_url ? (
                                <img src={groupWinner.logo_url} alt={groupWinner.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                                    {groupWinner.name.substring(0, 1)}
                                </div>
                            )}
                            <span className="text-sm font-bold text-white text-center truncate w-full">{groupWinner.name}</span>
                        </div>
                    ) : (
                        <span className="text-xs text-gray-600">?</span>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
