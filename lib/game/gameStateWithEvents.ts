import {
  GameState,
  GameStateWithEvents,
  GameEvent,
  TurnOutcome,
  Team,
  CardColor
} from '../types/game';
import {
  createInitialGameState,
  startGame as baseStartGame,
  revealCard as baseRevealCard,
  passTurn as basePassTurn,
  resetGame as baseResetGame,
  setClue as baseSetClue
} from './gameState';

/**
 * Creates an event for game feedback
 */
function createEvent(
  type: TurnOutcome,
  message: string,
  team?: Team,
  cardRevealed?: string
): GameEvent {
  return {
    type,
    message,
    team,
    cardRevealed,
    timestamp: Date.now()
  };
}

/**
 * Determines the outcome of revealing a card
 */
function determineOutcome(
  cardColor: CardColor,
  currentTeam: Team,
  isWin: boolean
): TurnOutcome {
  if (isWin) return 'WIN';
  if (cardColor === 'ASSASSIN') return 'ASSASSIN';
  if (cardColor === 'NEUTRAL') return 'NEUTRAL';
  if (cardColor === currentTeam) return 'CORRECT_TEAM';
  return 'WRONG_TEAM';
}

/**
 * Creates event message based on outcome
 */
function createOutcomeMessage(
  outcome: TurnOutcome,
  cardWord: string,
  cardColor: CardColor,
  team: Team
): string {
  switch (outcome) {
    case 'CORRECT_TEAM':
      return `✓ Correct! ${cardWord} belongs to ${team} team. Continue guessing!`;
    case 'WRONG_TEAM':
      const opponentTeam = team === 'RED' ? 'BLUE' : 'RED';
      return `✗ Wrong! ${cardWord} belongs to ${opponentTeam} team. Turn ends.`;
    case 'NEUTRAL':
      return `○ Neutral! ${cardWord} is a bystander. Turn ends.`;
    case 'ASSASSIN':
      return `💀 ASSASSIN! ${cardWord} was the assassin. Game Over!`;
    case 'WIN':
      return `🎉 Victory! ${team} team has revealed all their cards!`;
    case 'PASS':
      return `⏭️ ${team} team passed their turn.`;
  }
}

/**
 * Creates an initial game state with events
 */
export function createInitialGameStateWithEvents(): GameStateWithEvents {
  const baseState = createInitialGameState();
  return {
    ...baseState,
    lastEvent: null,
    eventHistory: []
  };
}

/**
 * Starts the game with event tracking
 */
export function startGameWithEvents(state: GameStateWithEvents): GameStateWithEvents {
  const newState = baseStartGame(state);
  const event = createEvent(
    'CORRECT_TEAM',
    `🎮 Game started! ${state.startingTeam} team goes first.`,
    state.startingTeam
  );

  return {
    ...newState,
    lastEvent: event,
    eventHistory: [...state.eventHistory, event]
  };
}

/**
 * Reveals a card with event tracking and detailed feedback
 */
export function revealCardWithEvents(
  state: GameStateWithEvents,
  cardIndex: number
): GameStateWithEvents {
  // Get the card before revealing
  const card = state.board[cardIndex];
  const currentTeam = state.currentTurn;

  // Perform the base reveal
  const newState = baseRevealCard(state, cardIndex);

  // Determine if this was a win
  const isWin = newState.gameStatus === 'RED_WIN' || newState.gameStatus === 'BLUE_WIN';

  // Determine outcome
  const outcome = determineOutcome(card.color, currentTeam, isWin);

  // Create message
  const message = createOutcomeMessage(outcome, card.word, card.color, currentTeam);

  // Create event
  const event = createEvent(outcome, message, currentTeam, card.word);

  return {
    ...newState,
    lastEvent: event,
    eventHistory: [...state.eventHistory, event]
  };
}

/**
 * Passes turn with event tracking
 */
export function passTurnWithEvents(state: GameStateWithEvents): GameStateWithEvents {
  const currentTeam = state.currentTurn;
  const newState = basePassTurn(state);

  const event = createEvent(
    'PASS',
    createOutcomeMessage('PASS', '', 'NEUTRAL', currentTeam),
    currentTeam
  );

  return {
    ...newState,
    lastEvent: event,
    eventHistory: [...state.eventHistory, event]
  };
}

/**
 * Sets a clue with event tracking
 */
export function setClueWithEvents(
  state: GameStateWithEvents,
  word: string,
  number: number
): GameStateWithEvents {
  const newState = baseSetClue(state, word, number);

  const event = createEvent(
    'CORRECT_TEAM',
    `🤖 AI Clue: "${word.toUpperCase()}" - ${number}. Make your guesses!`,
    state.currentTurn
  );

  return {
    ...newState,
    lastEvent: event,
    eventHistory: [...state.eventHistory, event]
  };
}

/**
 * Resets the game with events
 */
export function resetGameWithEvents(): GameStateWithEvents {
  const baseState = baseResetGame();
  return {
    ...baseState,
    lastEvent: null,
    eventHistory: []
  };
}

/**
 * Clears the last event (for dismissing notifications)
 */
export function clearLastEvent(state: GameStateWithEvents): GameStateWithEvents {
  return {
    ...state,
    lastEvent: null
  };
}

/**
 * Gets the most recent events (for displaying history)
 */
export function getRecentEvents(
  state: GameStateWithEvents,
  count: number = 5
): GameEvent[] {
  return state.eventHistory.slice(-count);
}
