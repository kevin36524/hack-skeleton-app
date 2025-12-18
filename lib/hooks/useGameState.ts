'use client';

import { useState, useCallback } from 'react';
import { GameState } from '../types/game';
import {
  createInitialGameState,
  startGame,
  revealCard,
  setClue,
  passTurn,
  resetGame
} from '../game/gameState';

/**
 * Custom hook for managing Codenames game state
 */
export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());

  /**
   * Start the game
   */
  const handleStartGame = useCallback(() => {
    setGameState(prevState => startGame(prevState));
  }, []);

  /**
   * Reveal a card at the given index
   */
  const handleRevealCard = useCallback((cardIndex: number) => {
    try {
      setGameState(prevState => revealCard(prevState, cardIndex));
    } catch (error) {
      console.error('Error revealing card:', error);
      // In production, you might want to show a user-friendly error message
    }
  }, []);

  /**
   * Set a new clue from AI
   */
  const handleSetClue = useCallback((word: string, number: number) => {
    try {
      setGameState(prevState => setClue(prevState, word, number));
    } catch (error) {
      console.error('Error setting clue:', error);
    }
  }, []);

  /**
   * Pass the current turn
   */
  const handlePassTurn = useCallback(() => {
    try {
      setGameState(prevState => passTurn(prevState));
    } catch (error) {
      console.error('Error passing turn:', error);
    }
  }, []);

  /**
   * Reset the game
   */
  const handleResetGame = useCallback(() => {
    setGameState(resetGame());
  }, []);

  return {
    gameState,
    startGame: handleStartGame,
    revealCard: handleRevealCard,
    setClue: handleSetClue,
    passTurn: handlePassTurn,
    resetGame: handleResetGame
  };
}
