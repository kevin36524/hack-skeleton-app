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
  setClue as baseSetClue,
  toggleAssassinNeutralized as baseToggleAssassinNeutralized
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
  isWin: boolean,
  assassinNeutralized: boolean = false
): TurnOutcome {
  if (isWin) return 'WIN';
  // If assassin is neutralized, treat it as neutral
  if (cardColor === 'ASSASSIN') {
    return assassinNeutralized ? 'NEUTRAL' : 'ASSASSIN';
  }
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
 * Helper to save current state to history before making changes
 */
function saveToHistory(state: GameStateWithEvents): GameState[] {
  const { lastEvent, eventHistory, history, ...baseState } = state;
  // Keep last 20 states for undo (prevents unbounded memory growth)
  const newHistory = [...history, baseState];
  return newHistory.length > 20 ? newHistory.slice(1) : newHistory;
}

/**
 * Creates an initial game state with events
 */
export function createInitialGameStateWithEvents(): GameStateWithEvents {
  const baseState = createInitialGameState();
  return {
    ...baseState,
    lastEvent: null,
    eventHistory: [],
    history: []
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
    eventHistory: [...state.eventHistory, event],
    history: saveToHistory(state)
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

  // Determine outcome (consider assassinNeutralized setting)
  const outcome = determineOutcome(card.color, currentTeam, isWin, state.assassinNeutralized);

  // Create message
  const message = createOutcomeMessage(outcome, card.word, card.color, currentTeam);

  // Create event
  const event = createEvent(outcome, message, currentTeam, card.word);

  return {
    ...newState,
    lastEvent: event,
    eventHistory: [...state.eventHistory, event],
    history: saveToHistory(state)
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
    eventHistory: [...state.eventHistory, event],
    history: saveToHistory(state)
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
    eventHistory: [...state.eventHistory, event],
    history: saveToHistory(state)
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
    eventHistory: [],
    history: []
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
 * Toggles assassin neutralization with event tracking
 */
export function toggleAssassinNeutralizedWithEvents(
  state: GameStateWithEvents
): GameStateWithEvents {
  const newState = baseToggleAssassinNeutralized(state);

  const event = createEvent(
    'CORRECT_TEAM',
    newState.assassinNeutralized
      ? '🛡️ Assassin cards are now neutralized (treated as neutral cards)'
      : '⚠️ Assassin cards are now active (will end the game)',
    state.currentTurn
  );

  return {
    ...newState,
    lastEvent: event,
    eventHistory: [...state.eventHistory, event],
    history: saveToHistory(state)
  };
}

/**
 * Undo the last action and restore the previous game state
 */
export function undoLastAction(state: GameStateWithEvents): GameStateWithEvents {
  if (state.history.length === 0) {
    return state; // Nothing to undo
  }

  // Get the previous state from history
  const previousState = state.history[state.history.length - 1];
  const newHistory = state.history.slice(0, -1);

  // Create an event for the undo action
  const event = createEvent(
    'CORRECT_TEAM',
    '↩️ Action undone',
    previousState.currentTurn
  );

  return {
    ...previousState,
    lastEvent: event,
    eventHistory: state.eventHistory, // Keep full event history
    history: newHistory
  };
}

/**
 * Check if undo is available
 */
export function canUndo(state: GameStateWithEvents): boolean {
  return state.history.length > 0;
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
