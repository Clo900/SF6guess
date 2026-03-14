import React from 'react';
import { clsx } from 'clsx';
import type { Team } from '@/types';

interface TeamChipProps {
  team: Team;
  className?: string;
}

export const TeamChip: React.FC<TeamChipProps> = ({ team, className }) => {
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
        {team.logo_url ? (
          <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[10px] font-bold text-gray-400">{team.name.substring(0, 2)}</span>
        )}
      </div>
      <span className="text-sm text-gray-200 truncate font-medium shadow-black drop-shadow-md">{team.name}</span>
    </div>
  );
};