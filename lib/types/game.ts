/**
 * Color types for Codenames cards
 */
export type CardColor = 'RED' | 'BLUE' | 'NEUTRAL' | 'ASSASSIN';

/**
 * Team types
 */
export type Team = 'RED' | 'BLUE';

/**
 * Game status types
 */
export type GameStatus = 'SETUP' | 'IN_PROGRESS' | 'RED_WIN' | 'BLUE_WIN' | 'ASSASSIN_HIT';

/**
 * Represents a single card on the game board
 */
export interface Card {
  word: string;
  color: CardColor;
  revealed: boolean;
}

/**
 * Represents a clue given by the AI
 */
export interface Clue {
  word: string;
  number: number;
  team: Team;
}

/**
 * Team score tracking
 */
export interface TeamScore {
  red: number;
  blue: number;
}

/**
 * Complete game state
 */
export interface GameState {
  board: Card[];
  currentTurn: Team;
  startingTeam: Team;
  gameStatus: GameStatus;
  score: TeamScore;
  currentClue: Clue | null;
  guessesRemaining: number;
  revealedCards: number;
}

/**
 * Configuration for board setup
 */
export interface BoardConfig {
  totalCards: number;
  redCards: number;
  blueCards: number;
  neutralCards: number;
  assassinCards: number;
}

/**
 * Turn outcome types
 */
export type TurnOutcome =
  | 'CORRECT_TEAM'      // Revealed own team's card, can continue
  | 'WRONG_TEAM'        // Revealed opponent's card, turn ends
  | 'NEUTRAL'           // Revealed neutral card, turn ends
  | 'ASSASSIN'          // Revealed assassin, game over
  | 'WIN'               // All team cards revealed, game won
  | 'PASS';             // Turn passed voluntarily

/**
 * Game event for notifications/feedback
 */
export interface GameEvent {
  type: TurnOutcome;
  message: string;
  team?: Team;
  cardRevealed?: string;
  timestamp: number;
}

/**
 * Extended game state with events
 */
export interface GameStateWithEvents extends GameState {
  lastEvent: GameEvent | null;
  eventHistory: GameEvent[];
}
