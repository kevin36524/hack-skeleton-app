'use client';

import { useState, useCallback, useEffect } from 'react';
import { GameStateWithEvents } from '../types/game';
import {
  createInitialGameStateWithEvents,
  startGameWithEvents,
  revealCardWithEvents,
  setClueWithEvents,
  passTurnWithEvents,
  resetGameWithEvents,
  clearLastEvent
} from '../game/gameStateWithEvents';
import { generateAIClue } from '../services/aiService';

/**
 * Custom hook for managing Codenames game state with events
 */
export function useGameState() {
  const [gameState, setGameState] = useState<GameStateWithEvents>(
    createInitialGameStateWithEvents()
  );
  const [isAIThinking, setIsAIThinking] = useState(false);

  /**
   * Start the game
   */
  const handleStartGame = useCallback(() => {
    setGameState(prevState => startGameWithEvents(prevState));
  }, []);

  /**
   * Reveal a card at the given index
   */
  const handleRevealCard = useCallback((cardIndex: number) => {
    try {
      setGameState(prevState => revealCardWithEvents(prevState, cardIndex));
    } catch (error) {
      console.error('Error revealing card:', error);
    }
  }, []);

  /**
   * Set a new clue from AI
   */
  const handleSetClue = useCallback((word: string, number: number) => {
    try {
      setGameState(prevState => setClueWithEvents(prevState, word, number));
    } catch (error) {
      console.error('Error setting clue:', error);
    }
  }, []);

  /**
   * Pass the current turn
   */
  const handlePassTurn = useCallback(() => {
    try {
      setGameState(prevState => passTurnWithEvents(prevState));
    } catch (error) {
      console.error('Error passing turn:', error);
    }
  }, []);

  /**
   * Reset the game
   */
  const handleResetGame = useCallback(() => {
    setGameState(resetGameWithEvents());
  }, []);

  /**
   * Clear the last event notification
   */
  const handleClearEvent = useCallback(() => {
    setGameState(prevState => clearLastEvent(prevState));
  }, []);

  /**
   * Request AI to generate a clue for the current team
   */
  const requestAIClue = useCallback(async () => {
    if (gameState.gameStatus !== 'IN_PROGRESS' || isAIThinking) {
      return;
    }

    setIsAIThinking(true);
    try {
      const aiResponse = await generateAIClue(gameState.board, gameState.currentTurn);
      handleSetClue(aiResponse.clue, aiResponse.number);
    } catch (error) {
      console.error('Failed to get AI clue:', error);
      // Optionally set an error event
    } finally {
      setIsAIThinking(false);
    }
  }, [gameState.board, gameState.currentTurn, gameState.gameStatus, isAIThinking, handleSetClue]);

  /**
   * Auto-generate clue when turn changes (if no clue exists and game is in progress)
   */
  useEffect(() => {
    if (
      gameState.gameStatus === 'IN_PROGRESS' &&
      !gameState.currentClue &&
      !isAIThinking
    ) {
      // Small delay to let UI update first
      const timer = setTimeout(() => {
        requestAIClue();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [gameState.currentTurn, gameState.gameStatus, gameState.currentClue, isAIThinking, requestAIClue]);

  return {
    gameState,
    isAIThinking,
    startGame: handleStartGame,
    revealCard: handleRevealCard,
    setClue: handleSetClue,
    passTurn: handlePassTurn,
    resetGame: handleResetGame,
    clearEvent: handleClearEvent,
    requestAIClue
  };
}
