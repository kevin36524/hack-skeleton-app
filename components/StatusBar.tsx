'use client';

import { GameStatus, Team, Clue } from '@/lib/types/game';

interface StatusBarProps {
  gameStatus: GameStatus;
  currentTurn: Team;
  redScore: number;
  blueScore: number;
  currentClue: Clue | null;
  guessesRemaining: number;
}

export function StatusBar({
  gameStatus,
  currentTurn,
  redScore,
  blueScore,
  currentClue,
  guessesRemaining
}: StatusBarProps) {
  const getStatusMessage = () => {
    switch (gameStatus) {
      case 'SETUP':
        return { text: 'Ready to Start', color: 'text-gray-300' };
      case 'IN_PROGRESS':
        return {
          text: `${currentTurn} Team's Turn`,
          color: currentTurn === 'RED' ? 'text-red-400' : 'text-blue-400'
        };
      case 'RED_WIN':
        return { text: '🎉 Red Team Wins!', color: 'text-red-400' };
      case 'BLUE_WIN':
        return { text: '🎉 Blue Team Wins!', color: 'text-blue-400' };
      case 'ASSASSIN_HIT':
        return { text: '💀 Assassin Revealed!', color: 'text-red-500' };
      default:
        return { text: 'Unknown Status', color: 'text-gray-300' };
    }
  };

  const status = getStatusMessage();

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Game Status */}
        <div className="flex items-center gap-2">
          <div className="text-white">
            <span className="text-xs text-gray-300">Status:</span>
            <span className={`ml-2 font-semibold text-base ${status.color}`}>
              {status.text}
            </span>
          </div>
        </div>

        {/* Scores */}
        <div className="flex gap-6">
          {/* Red Score */}
          <div className="relative">
            <div className="text-center">
              <div className="text-red-400 text-2xl font-bold">{redScore}</div>
              <div className="text-xs text-gray-300">Red</div>
            </div>
            {currentTurn === 'RED' && gameStatus === 'IN_PROGRESS' && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>

          {/* Blue Score */}
          <div className="relative">
            <div className="text-center">
              <div className="text-blue-400 text-2xl font-bold">{blueScore}</div>
              <div className="text-xs text-gray-300">Blue</div>
            </div>
            {currentTurn === 'BLUE' && gameStatus === 'IN_PROGRESS' && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Current Clue Display */}
      {currentClue && gameStatus === 'IN_PROGRESS' && (
        <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/20">
          <div className="text-white text-center">
            <span className="text-xs text-gray-300">AI Clue:</span>
            <span className={`ml-2 text-lg font-bold ${
              currentClue.team === 'RED' ? 'text-red-300' : 'text-blue-300'
            }`}>
              {currentClue.word.toUpperCase()}
            </span>
            <span className="mx-2 text-gray-400">—</span>
            <span className="text-lg font-bold text-white">
              {currentClue.number}
            </span>
            <div className="mt-1 text-xs text-gray-300">
              {guessesRemaining > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  {guessesRemaining} {guessesRemaining === 1 ? 'guess' : 'guesses'} remaining
                </span>
              ) : (
                <span className="text-yellow-300">Pass turn or continue guessing</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
