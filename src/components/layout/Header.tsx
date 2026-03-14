import React from 'react';
import { clsx } from 'clsx';
import { Timer } from '../ui/Timer';

interface HeaderProps {
  stages: { id: string; name: string }[];
  currentStageId: string;
  onStageChange: (stageId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  stages,
  currentStageId,
  onStageChange,
}) => {
  return (
    <header className="flex flex-col gap-4 p-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
            亚历克斯杯
          </h1>
          <nav className="flex items-center gap-2">
            {stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => onStageChange(stage.id)}
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  currentStageId === stage.id
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                {stage.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};
