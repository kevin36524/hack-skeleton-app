import { GameState, Team, Card, GameStatus } from '../types/game';
import {
  generateBoard,
  determineStartingTeam,
  getBoardConfig,
  checkWinCondition,
  countRemainingCards
} from './boardGenerator';

/**
 * Creates an initial game state
 */
export function createInitialGameState(): GameState {
  const startingTeam = determineStartingTeam();
  const board = generateBoard(startingTeam);
  const config = getBoardConfig(startingTeam);

  return {
    board,
    currentTurn: startingTeam,
    startingTeam,
    gameStatus: 'SETUP',
    score: {
      red: config.redCards,
      blue: config.blueCards
    },
    currentClue: null,
    guessesRemaining: 0,
    revealedCards: 0
  };
}

/**
 * Starts the game (transitions from SETUP to IN_PROGRESS)
 */
export function startGame(state: GameState): GameState {
  return {
    ...state,
    gameStatus: 'IN_PROGRESS'
  };
}

/**
 * Reveals a card and updates the game state accordingly
 */
export function revealCard(state: GameState, cardIndex: number): GameState {
  if (state.gameStatus !== 'IN_PROGRESS') {
    throw new Error('Cannot reveal card: Game is not in progress');
  }

  if (cardIndex < 0 || cardIndex >= state.board.length) {
    throw new Error('Invalid card index');
  }

  const card = state.board[cardIndex];

  if (card.revealed) {
    throw new Error('Card is already revealed');
  }

  // Create new board with revealed card
  const newBoard = state.board.map((c, idx) =>
    idx === cardIndex ? { ...c, revealed: true } : c
  );

  // Update scores
  const remaining = countRemainingCards(newBoard);
  const newScore = {
    red: remaining.red,
    blue: remaining.blue
  };

  // Check win condition
  const winner = checkWinCondition(newBoard);
  let newStatus: GameStatus = state.gameStatus;

  if (winner === 'ASSASSIN') {
    // Team that revealed assassin loses, other team wins
    newStatus = state.currentTurn === 'RED' ? 'BLUE_WIN' : 'RED_WIN';
  } else if (winner === 'RED') {
    newStatus = 'RED_WIN';
  } else if (winner === 'BLUE') {
    newStatus = 'BLUE_WIN';
  }

  // Determine if turn should continue or switch
  let newTurn = state.currentTurn;
  let newGuessesRemaining = state.guessesRemaining - 1;

  // Switch turn if:
  // 1. Wrong color was revealed
  // 2. Neutral or assassin was revealed
  // 3. No guesses remaining
  if (
    card.color !== state.currentTurn ||
    card.color === 'NEUTRAL' ||
    card.color === 'ASSASSIN' ||
    newGuessesRemaining <= 0
  ) {
    newTurn = state.currentTurn === 'RED' ? 'BLUE' : 'RED';
    newGuessesRemaining = 0;
  }

  return {
    ...state,
    board: newBoard,
    score: newScore,
    currentTurn: newTurn,
    gameStatus: newStatus,
    guessesRemaining: newGuessesRemaining,
    revealedCards: state.revealedCards + 1
  };
}

/**
 * Sets a new clue from the AI codemaster
 */
export function setClue(state: GameState, word: string, number: number): GameState {
  if (state.gameStatus !== 'IN_PROGRESS') {
    throw new Error('Cannot set clue: Game is not in progress');
  }

  return {
    ...state,
    currentClue: {
      word,
      number,
      team: state.currentTurn
    },
    guessesRemaining: number + 1 // Players get number + 1 guesses
  };
}

/**
 * Passes the current turn to the other team
 */
export function passTurn(state: GameState): GameState {
  if (state.gameStatus !== 'IN_PROGRESS') {
    throw new Error('Cannot pass turn: Game is not in progress');
  }

  const newTurn = state.currentTurn === 'RED' ? 'BLUE' : 'RED';

  return {
    ...state,
    currentTurn: newTurn,
    guessesRemaining: 0,
    currentClue: null
  };
}

/**
 * Resets the game with a new board
 */
export function resetGame(): GameState {
  return createInitialGameState();
}

/**
 * Gets unrevealed cards for a specific color (used by AI)
 */
export function getUnrevealedCardsForColor(
  state: GameState,
  color: 'RED' | 'BLUE'
): Card[] {
  return state.board.filter(card => !card.revealed && card.color === color);
}

/**
 * Gets all unrevealed cards
 */
export function getUnrevealedCards(state: GameState): Card[] {
  return state.board.filter(card => !card.revealed);
}

/**
 * Gets revealed cards
 */
export function getRevealedCards(state: GameState): Card[] {
  return state.board.filter(card => card.revealed);
}
