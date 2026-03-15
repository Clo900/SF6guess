import React from 'react';
import { Card } from '../ui/Card';
import type { LeaderboardEntry } from '@/types';
import { Trophy } from 'lucide-react';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries }) => {
  return (
    <Card className="w-72 h-fit flex flex-col gap-4 shrink-0 bg-slate-900/80 border-slate-800">
      <div className="flex items-center gap-2 text-emerald-400 pb-2 border-b border-white/10">
        <Trophy className="w-5 h-5" />
        <h3 className="font-bold">已确认竞猜的观众排行榜</h3>
      </div>
      
      <div className="flex flex-col gap-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {entries.map((entry, index) => (
          <div
            key={entry.user_id}
            className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={`text-sm font-mono w-4 text-center ${
                index < 3 ? 'text-yellow-400 font-bold' : 'text-gray-500'
              }`}>
                {index + 1}
              </span>
              <span className="text-sm text-gray-200 truncate max-w-[120px]" title={entry.nickname || entry.username}>
                {entry.nickname || entry.username}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">
                {entry.total_items}/{entry.possible_items}
              </span>
              <span className="text-sm font-bold text-emerald-500 w-8 text-right">
                {entry.score}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
