'use client';

import { useState, useCallback } from 'react';
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

/**
 * Custom hook for managing Codenames game state with events
 */
export function useGameState() {
  const [gameState, setGameState] = useState<GameStateWithEvents>(
    createInitialGameStateWithEvents()
  );

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

  return {
    gameState,
    startGame: handleStartGame,
    revealCard: handleRevealCard,
    setClue: handleSetClue,
    passTurn: handlePassTurn,
    resetGame: handleResetGame,
    clearEvent: handleClearEvent
  };
}
