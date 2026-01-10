'use client';

import { GameStatus } from '@/lib/types/game';

interface GameControlsProps {
  gameStatus: GameStatus;
  onStartGame: () => void;
  onPassTurn: () => void;
  onResetGame: () => void;
  assassinNeutralized: boolean;
  onToggleAssassinNeutralized: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export function GameControls({
  gameStatus,
  onStartGame,
  onPassTurn,
  onResetGame,
  assassinNeutralized,
  onToggleAssassinNeutralized,
  onUndo,
  canUndo
}: GameControlsProps) {
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {gameStatus === 'SETUP' && (
        <button
          onClick={onStartGame}
          className="px-6 py-2 text-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="flex items-center gap-2">
            <span>🎮</span>
            <span>Start Game</span>
          </span>
        </button>
      )}

      {gameStatus === 'IN_PROGRESS' && (
        <>
          <button
            onClick={onPassTurn}
            className="px-6 py-2 text-sm bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="flex items-center gap-2">
              <span>⏭️</span>
              <span>Pass Turn</span>
            </span>
          </button>

          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`px-6 py-2 text-sm rounded-lg font-semibold transition-all shadow-md transform ${
              canUndo
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>↩️</span>
              <span>Undo</span>
            </span>
          </button>
        </>
      )}

      {(gameStatus === 'RED_WIN' || gameStatus === 'BLUE_WIN' || gameStatus === 'ASSASSIN_HIT') && (
        <button
          onClick={onResetGame}
          className="px-6 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 animate-pulse"
        >
          <span className="flex items-center gap-2">
            <span>🔄</span>
            <span>Play Again</span>
          </span>
        </button>
      )}

      {gameStatus === 'IN_PROGRESS' && (
        <button
          onClick={onResetGame}
          className="px-6 py-2 text-sm bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="flex items-center gap-2">
            <span>🔄</span>
            <span>New Game</span>
          </span>
        </button>
      )}

      {(gameStatus === 'SETUP' || gameStatus === 'IN_PROGRESS') && (
        <button
          onClick={onToggleAssassinNeutralized}
          className={`px-6 py-2 text-sm rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 ${
            assassinNeutralized
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
              : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>{assassinNeutralized ? '🛡️' : '💀'}</span>
            <span>{assassinNeutralized ? 'Assassin: Safe' : 'Assassin: Active'}</span>
          </span>
        </button>
      )}
    </div>
  );
}
