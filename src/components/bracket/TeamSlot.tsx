import React from 'react';
import { clsx } from 'clsx';
import type { Team } from '@/types';
import { TeamChip } from '../ui/TeamChip';

interface TeamSlotProps {
  id: string;
  team?: Team;
  isWinner?: boolean;
  isLoser?: boolean;
  matchId?: string; // Optional now
  onClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  placeholder?: string;
  className?: string;
}

export const TeamSlot: React.FC<TeamSlotProps> = ({ 
  id, 
  team, 
  isWinner, 
  isLoser, 
  onClick, 
  onContextMenu,
  placeholder = '?',
  className
}) => {
  return (
    <div
      className={clsx(
        'flex items-center gap-2 p-2 rounded transition-colors border min-h-[40px] relative',
        'cursor-pointer select-none',
        'border-white/10 hover:bg-white/5',
        isWinner ? 'bg-emerald-900/30 border-emerald-500' : '',
        isLoser ? 'bg-red-900/30 border-red-500' : '',
        !team && 'justify-center',
        className
      )}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {team ? (
        <div className="flex items-center gap-2 w-full h-full">
          <TeamChip team={team} />
        </div>
      ) : (
        <span className="text-gray-500 text-xs pointer-events-none">{placeholder}</span>
      )}
    </div>
  );
};