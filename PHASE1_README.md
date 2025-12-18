# AI Codenames - Phase 1 Complete

## Overview
Phase 1 implements the core game state and data layer for AI-powered Codenames.

## What's Implemented

### 1. Type Definitions (`lib/types/game.ts`)
- `CardColor`: RED, BLUE, NEUTRAL, ASSASSIN
- `Team`: RED, BLUE
- `GameStatus`: SETUP, IN_PROGRESS, RED_WIN, BLUE_WIN, ASSASSIN_HIT
- `Card`: Represents a card on the board with word, color, and revealed status
- `Clue`: AI-generated clue with word, number, and team
- `GameState`: Complete game state including board, turn, status, scores
- `BoardConfig`: Configuration for card distribution

### 2. Word Pool (`lib/data/wordPool.ts`)
- Contains 80 common, family-friendly words across categories:
  - Animals (10 words)
  - Nature (10 words)
  - Objects (10 words)
  - Places (10 words)
  - Food (10 words)
  - Actions/Concepts (10 words)
  - Body (8 words)
  - Colors/Descriptors (10 words)
- Helper functions for pool validation

### 3. Board Generation Logic (`lib/game/boardGenerator.ts`)
- `determineStartingTeam()`: Randomly selects RED or BLUE to start
- `getBoardConfig()`: Returns card distribution (9 for starting team, 8 for other, 7 neutral, 1 assassin)
- `generateBoard()`: Creates a 25-card board with:
  - Random word selection from pool
  - Random color assignment
  - All cards start unrevealed
- `countRemainingCards()`: Counts unrevealed cards by color
- `checkWinCondition()`: Determines if game is won or lost
- Fisher-Yates shuffle algorithm for randomization

### 4. Game State Management (`lib/game/gameState.ts`)
Functions to manage game state:
- `createInitialGameState()`: Initialize new game
- `startGame()`: Transition from SETUP to IN_PROGRESS
- `revealCard()`: Reveal a card and update game state
- `setClue()`: Set AI-generated clue
- `passTurn()`: Switch to other team
- `resetGame()`: Create new game
- Helper functions to query game state

### 5. React Hook (`lib/hooks/useGameState.ts`)
Custom hook `useGameState()` provides:
- `gameState`: Current game state
- `startGame()`: Start the game
- `revealCard(index)`: Reveal a card
- `setClue(word, number)`: Set AI clue
- `passTurn()`: Pass turn to other team
- `resetGame()`: Reset to new game

### 6. UI Implementation (`app/page.tsx`)
React component with:
- Game header with title
- Status panel showing:
  - Current game status
  - Team scores (remaining cards)
  - Control buttons (Start Game, Pass Turn, New Game)
  - Current clue display (when active)
- 5x5 game board grid:
  - 25 clickable card buttons
  - Color-coded when revealed (red, blue, gray, black)
  - Hover effects and animations
- Game information panel:
  - Starting team
  - Cards revealed counter
  - How to play instructions

## Game Rules Implemented

### Card Distribution
- **Starting team**: 9 cards
- **Other team**: 8 cards
- **Neutral**: 7 cards
- **Assassin**: 1 card

### Turn Logic
- Turn continues if correct color is revealed
- Turn ends if:
  - Wrong team's card is revealed
  - Neutral card is revealed
  - Assassin is revealed (game over)
  - No guesses remaining
  - Team passes turn

### Win Conditions
- **Team wins**: All their cards are revealed
- **Team loses**: They reveal the assassin card

### Clue System (Ready for AI)
- Clue includes: word + number
- Players get (number + 1) guesses
- Guess counter tracks remaining guesses

## Project Structure
```
lib/
├── types/
│   ├── game.ts          # TypeScript interfaces and types
│   └── index.ts         # Type exports
├── data/
│   ├── wordPool.ts      # 80 word pool
│   └── index.ts         # Data exports
├── game/
│   ├── boardGenerator.ts # Board creation logic
│   ├── gameState.ts      # State management functions
│   └── index.ts          # Game exports
└── hooks/
    └── useGameState.ts   # React hook for game state

app/
└── page.tsx              # Main game UI
```

## Testing the Implementation

### Manual Testing Steps:
1. **Start Game**:
   - Click "Start Game" button
   - Verify status changes to "[TEAM] Team's Turn"
   - Verify 25 cards are displayed
   - Check scores show 9 and 8

2. **Reveal Cards**:
   - Click on cards to reveal them
   - Verify color changes based on card type
   - Check score updates when team card is revealed
   - Verify turn switches on wrong card

3. **Pass Turn**:
   - Click "Pass Turn" during game
   - Verify turn switches to other team

4. **New Game**:
   - Click "New Game"
   - Verify board regenerates with new words
   - Check game resets to SETUP status

5. **Win Condition**:
   - Reveal all cards of one color
   - Verify win message appears

## Ready for Next Phase

The game state layer is complete and ready for Phase 2, which will include:
- AI Codemaster integration with Mastra
- Automatic clue generation
- API endpoints for AI communication
- Enhanced UI feedback

## Notes
- All state management is client-side using React hooks
- Game logic is pure functions (no side effects)
- Board generation is deterministic once initialized
- Type-safe throughout with TypeScript
- Responsive UI with Tailwind CSS
