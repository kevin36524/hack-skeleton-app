'use client';

import { Team } from '@/lib/types/game';

interface GameInfoProps {
  startingTeam: Team;
  revealedCards: number;
  totalCards?: number;
}

export function GameInfo({
  startingTeam,
  revealedCards,
  totalCards = 25
}: GameInfoProps) {
  const progress = (revealedCards / totalCards) * 100;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
      <div className="flex items-center justify-between text-white flex-wrap gap-4">
        {/* Starting Team */}
        <div className="flex items-center gap-2">
          <div>
            <p className="text-xs text-gray-300">Starting Team:</p>
            <p className={`font-semibold text-sm ${
              startingTeam === 'RED' ? 'text-red-400' : 'text-blue-400'
            }`}>
              {startingTeam} Team
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-xs">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-300">Game Progress</p>
            <p className="text-xs text-gray-300">{revealedCards} / {totalCards}</p>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quick Rules */}
        <div className="text-xs text-gray-200 max-w-md">
          <span className="font-semibold text-white">Rules:</span>{' '}
          <span className="text-red-400">Red</span> vs{' '}
          <span className="text-blue-400">Blue</span> •{' '}
          <span className="text-gray-300">Neutral</span> •{' '}
          <span className="text-red-500">💀 Assassin</span> = instant loss
        </div>
      </div>
    </div>
  );
}
