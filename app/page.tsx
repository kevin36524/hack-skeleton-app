'use client';

import { useGameState } from '@/lib/hooks/useGameState';
import { GameBoard } from '@/components/GameBoard';
import { StatusBar } from '@/components/StatusBar';
import { GameControls } from '@/components/GameControls';
import { GameInfo } from '@/components/GameInfo';
import { GameNotification } from '@/components/GameNotification';
import { AIThinking } from '@/components/AIThinking';

export default function Home() {
  const { gameState, isAIThinking, startGame, revealCard, passTurn, resetGame, clearEvent } = useGameState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 py-6">
      {/* AI Thinking Overlay */}
      <AIThinking team={gameState.currentTurn} isVisible={isAIThinking} />

      {/* Game Notification */}
      <GameNotification
        event={gameState.lastEvent}
        onDismiss={clearEvent}
        autoDismiss={true}
        autoDismissDelay={3500}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-4">
          <h1 className="text-3xl font-bold text-white mb-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Codenames
          </h1>
          <p className="text-gray-300 text-sm">
            Play Codenames with AI as your Codemaster
          </p>
        </header>

        {/* Status Bar */}
        <StatusBar
          gameStatus={gameState.gameStatus}
          currentTurn={gameState.currentTurn}
          redScore={gameState.score.red}
          blueScore={gameState.score.blue}
          currentClue={gameState.currentClue}
          guessesRemaining={gameState.guessesRemaining}
        />

        {/* Game Controls */}
        <div className="mb-4">
          <GameControls
            gameStatus={gameState.gameStatus}
            onStartGame={startGame}
            onPassTurn={passTurn}
            onResetGame={resetGame}
          />
        </div>

        {/* Game Board */}
        <div className="mb-4">
          <GameBoard
            cards={gameState.board}
            onRevealCard={revealCard}
            disabled={gameState.gameStatus !== 'IN_PROGRESS'}
          />
        </div>

        {/* Game Info */}
        <GameInfo
          startingTeam={gameState.startingTeam}
          revealedCards={gameState.revealedCards}
          totalCards={25}
        />
      </div>
    </div>
  );
}
