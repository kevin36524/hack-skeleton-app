import { WORD_POOL } from '../data/wordPool';
import { Card, CardColor, Team, BoardConfig } from '../types/game';

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Randomly selects n unique words from the word pool
 */
function selectRandomWords(count: number): string[] {
  if (count > WORD_POOL.length) {
    throw new Error(`Cannot select ${count} words from pool of ${WORD_POOL.length}`);
  }

  const shuffled = shuffleArray(WORD_POOL);
  return shuffled.slice(0, count);
}

/**
 * Determines which team starts (random)
 */
export function determineStartingTeam(): Team {
  return Math.random() < 0.5 ? 'RED' : 'BLUE';
}

/**
 * Gets the board configuration based on starting team
 * Starting team gets 9 cards, other team gets 8
 */
export function getBoardConfig(startingTeam: Team): BoardConfig {
  return {
    totalCards: 25,
    redCards: startingTeam === 'RED' ? 9 : 8,
    blueCards: startingTeam === 'BLUE' ? 9 : 8,
    neutralCards: 7,
    assassinCards: 1
  };
}

/**
 * Generates the color distribution for cards
 */
function generateColorDistribution(config: BoardConfig): CardColor[] {
  const colors: CardColor[] = [];

  // Add red cards
  for (let i = 0; i < config.redCards; i++) {
    colors.push('RED');
  }

  // Add blue cards
  for (let i = 0; i < config.blueCards; i++) {
    colors.push('BLUE');
  }

  // Add neutral cards
  for (let i = 0; i < config.neutralCards; i++) {
    colors.push('NEUTRAL');
  }

  // Add assassin cards
  for (let i = 0; i < config.assassinCards; i++) {
    colors.push('ASSASSIN');
  }

  return shuffleArray(colors);
}

/**
 * Generates a new game board with 25 random words and assigned colors
 */
export function generateBoard(startingTeam: Team): Card[] {
  const config = getBoardConfig(startingTeam);

  // Select 25 random words
  const words = selectRandomWords(config.totalCards);

  // Generate and shuffle color distribution
  const colors = generateColorDistribution(config);

  // Create cards by combining words and colors
  const board: Card[] = words.map((word, index) => ({
    word,
    color: colors[index],
    revealed: false
  }));

  return board;
}

/**
 * Counts remaining cards for each color
 */
export function countRemainingCards(board: Card[]): {
  red: number;
  blue: number;
  neutral: number;
  assassin: number;
} {
  return board.reduce(
    (acc, card) => {
      if (!card.revealed) {
        if (card.color === 'RED') acc.red++;
        else if (card.color === 'BLUE') acc.blue++;
        else if (card.color === 'NEUTRAL') acc.neutral++;
        else if (card.color === 'ASSASSIN') acc.assassin++;
      }
      return acc;
    },
    { red: 0, blue: 0, neutral: 0, assassin: 0 }
  );
}

/**
 * Checks if the game is won by either team
 */
export function checkWinCondition(board: Card[]): 'RED' | 'BLUE' | 'ASSASSIN' | null {
  const remaining = countRemainingCards(board);

  // Check if assassin was revealed
  const assassinRevealed = board.some(
    card => card.color === 'ASSASSIN' && card.revealed
  );
  if (assassinRevealed) {
    return 'ASSASSIN';
  }

  // Check if red team won
  if (remaining.red === 0) {
    return 'RED';
  }

  // Check if blue team won
  if (remaining.blue === 0) {
    return 'BLUE';
  }

  return null;
}
