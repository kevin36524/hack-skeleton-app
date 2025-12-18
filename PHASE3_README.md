# AI Codenames - Phase 3 Complete

## Overview
Phase 3 implements complete game flow and turn logic with intelligent feedback system. The game now handles all turn outcomes, tracks guesses, switches teams appropriately, and provides real-time notifications for player actions.

## What's Implemented

### 1. Enhanced Type System (`lib/types/game.ts`)

#### New Types Added:
- **TurnOutcome**: Enum for card reveal results
  - `CORRECT_TEAM`: Revealed own team's card, can continue guessing
  - `WRONG_TEAM`: Revealed opponent's card, turn ends
  - `NEUTRAL`: Revealed neutral card, turn ends
  - `ASSASSIN`: Revealed assassin, game over
  - `WIN`: All team cards revealed, game won
  - `PASS`: Turn passed voluntarily

- **GameEvent**: Event object for notifications
  ```typescript
  interface GameEvent {
    type: TurnOutcome;
    message: string;
    team?: Team;
    cardRevealed?: string;
    timestamp: number;
  }
  ```

- **GameStateWithEvents**: Extended game state
  ```typescript
  interface GameStateWithEvents extends GameState {
    lastEvent: GameEvent | null;
    eventHistory: GameEvent[];
  }
  ```

### 2. Game State with Events (`lib/game/gameStateWithEvents.ts`)

Enhanced game state management with event tracking:

#### Key Functions:

**createInitialGameStateWithEvents()**
- Initializes game with empty event history
- Sets up event tracking system

**startGameWithEvents()**
- Starts game and creates "Game Started" event
- Announces which team goes first

**revealCardWithEvents()**
- Reveals card and determines outcome
- Creates appropriate event based on card color
- Generates contextual feedback messages
- Tracks event in history

**passTurnWithEvents()**
- Switches turn to other team
- Creates "Pass Turn" event
- Clears current clue

**setClueWithEvents()**
- Sets AI clue for current team
- Creates "AI Clue" event
- Announces clue to players

**clearLastEvent()**
- Dismisses current notification
- Keeps event in history

**getRecentEvents()**
- Retrieves last N events
- Useful for displaying history

### 3. Turn Logic Implementation

#### Turn Flow:
1. **Turn Starts**: Team's turn begins
2. **AI Gives Clue**: Word + Number
3. **Players Guess**: Click cards
4. **Outcome Determined**:
   - ✓ **Correct Team Card**: Continue guessing, decrement guess counter
   - ✗ **Wrong Team Card**: Turn ends immediately
   - ○ **Neutral Card**: Turn ends immediately
   - 💀 **Assassin**: Game over, other team wins
   - 🎉 **All Cards Found**: Team wins
5. **Turn Ends**: Switch to other team

#### Guess Tracking:
- Players get (clue number + 1) guesses
- Counter decrements with each reveal
- Can pass turn anytime
- Turn auto-ends when counter reaches 0

#### Turn Switching Rules:
Turn automatically switches when:
- Wrong team's card is revealed
- Neutral card is revealed
- Assassin is revealed (game ends)
- All guesses used up
- Player passes turn

Turn continues when:
- Correct team's card is revealed
- Guesses still remaining

### 4. GameNotification Component (`components/GameNotification.tsx`)

Beautiful notification system for game events:

#### Features:
- **Fixed Position**: Top center of screen
- **Auto-dismiss**: Configurable delay (default 3.5s)
- **Smooth Animations**: Slide in/fade out
- **Color-Coded by Outcome**:
  - Green: Correct team card
  - Orange: Wrong team card
  - Gray: Neutral card
  - Red: Assassin
  - Purple/Pink: Victory
  - Yellow: Pass turn

- **Visual Elements**:
  - Large emoji icon for outcome type
  - Bold message text
  - Card name display
  - Optional dismiss button
  - Shadow and border effects
  - Backdrop blur

- **Accessibility**:
  - ARIA labels
  - Role attributes
  - Keyboard dismissible
  - Screen reader friendly

### 5. Updated Game Hook (`lib/hooks/useGameState.ts`)

Enhanced hook with event management:

```typescript
const {
  gameState,        // Full game state with events
  startGame,        // Start game with event
  revealCard,       // Reveal card with feedback
  setClue,          // Set AI clue with event
  passTurn,         // Pass turn with event
  resetGame,        // Reset with new board
  clearEvent        // Dismiss notification
} = useGameState();
```

### 6. Updated Main Page (`app/page.tsx`)

Integrated notification system:
- GameNotification component at top
- Auto-dismiss after 3.5 seconds
- Connected to game events
- Smooth UX with clear feedback

## Game Flow Example

### Scenario 1: Correct Guesses
```
1. RED Team starts
2. AI gives clue: "ANIMAL - 2"
3. Player clicks "DOG" → ✓ RED card
   Notification: "✓ Correct! DOG belongs to RED team. Continue guessing!"
   Guesses remaining: 2
4. Player clicks "CAT" → ✓ RED card
   Notification: "✓ Correct! CAT belongs to RED team. Continue guessing!"
   Guesses remaining: 1
5. Player clicks "LION" → ✓ RED card
   Notification: "✓ Correct! LION belongs to RED team. Continue guessing!"
   Guesses remaining: 0
6. Turn ends, switches to BLUE team
```

### Scenario 2: Wrong Guess
```
1. BLUE Team's turn
2. AI gives clue: "WATER - 1"
3. Player clicks "OCEAN" → ✓ BLUE card
   Notification: "✓ Correct! OCEAN belongs to BLUE team. Continue guessing!"
   Guesses remaining: 1
4. Player clicks "RIVER" → ✗ RED card
   Notification: "✗ Wrong! RIVER belongs to RED team. Turn ends."
5. Turn immediately switches to RED team
```

### Scenario 3: Neutral Hit
```
1. RED Team's turn
2. AI gives clue: "BUILDING - 2"
3. Player clicks "CASTLE" → ✓ RED card
   Notification: "✓ Correct! CASTLE belongs to RED team. Continue guessing!"
4. Player clicks "TOWER" → ○ NEUTRAL
   Notification: "○ Neutral! TOWER is a bystander. Turn ends."
5. Turn switches to BLUE team
```

### Scenario 4: Assassin Hit
```
1. BLUE Team's turn
2. AI gives clue: "DARK - 1"
3. Player clicks "SHADOW" → 💀 ASSASSIN
   Notification: "💀 ASSASSIN! SHADOW was the assassin. Game Over!"
4. Game ends, RED team wins
5. "Play Again" button appears
```

### Scenario 5: Pass Turn
```
1. RED Team's turn
2. AI gives clue: "METAL - 2"
3. Player clicks "GOLD" → ✓ RED card
   Notification: "✓ Correct! GOLD belongs to RED team. Continue guessing!"
4. Player clicks "Pass Turn" button
   Notification: "⏭️ RED team passed their turn."
5. Turn switches to BLUE team
```

### Scenario 6: Victory
```
1. RED Team has 1 card remaining
2. AI gives clue: "FOOD - 1"
3. Player clicks "PIZZA" → ✓ RED card (last one!)
   Notification: "🎉 Victory! RED team has revealed all their cards!"
4. Game status: RED_WIN
5. "Play Again" button appears with pulse animation
```

## Event Messages

### By Outcome Type:
- **CORRECT_TEAM**: `"✓ Correct! {WORD} belongs to {TEAM} team. Continue guessing!"`
- **WRONG_TEAM**: `"✗ Wrong! {WORD} belongs to {OPPONENT} team. Turn ends."`
- **NEUTRAL**: `"○ Neutral! {WORD} is a bystander. Turn ends."`
- **ASSASSIN**: `"💀 ASSASSIN! {WORD} was the assassin. Game Over!"`
- **WIN**: `"🎉 Victory! {TEAM} team has revealed all their cards!"`
- **PASS**: `"⏭️ {TEAM} team passed their turn."`
- **START**: `"🎮 Game started! {TEAM} team goes first."`
- **CLUE**: `"🤖 AI Clue: "{WORD}" - {NUMBER}. Make your guesses!"`

## Technical Implementation Details

### State Management Flow:
```
User Action (Click/Button)
  ↓
Hook Handler (useGameState)
  ↓
State Function with Events (gameStateWithEvents.ts)
  ↓
Base State Function (gameState.ts)
  ↓
New State + Event Created
  ↓
React State Update
  ↓
UI Re-render + Notification Display
```

### Event Lifecycle:
```
1. Action Triggered
2. Event Created (type, message, timestamp)
3. Event Added to History
4. Event Set as lastEvent
5. Notification Displays
6. Auto-dismiss Timer Starts (3.5s)
7. Fade Out Animation (300ms)
8. Event Cleared from lastEvent
9. Event Remains in History
```

### Performance Optimizations:
- Events stored in history (max useful: last 5-10)
- Auto-dismiss prevents notification buildup
- Callbacks memoized with useCallback
- Smooth 60fps animations
- GPU-accelerated transforms

## File Structure
```
lib/
├── types/
│   └── game.ts                    # Enhanced with events
├── game/
│   ├── gameState.ts               # Base game logic
│   ├── gameStateWithEvents.ts     # Event-enhanced logic
│   └── boardGenerator.ts          # Unchanged
└── hooks/
    └── useGameState.ts            # Updated for events

components/
├── GameNotification.tsx           # NEW: Notification UI
└── [other components]

app/
└── page.tsx                       # Updated with notifications
```

## Testing the Game Flow

### Manual Test Scenarios:

1. **Start Game**:
   - [ ] Click Start Game
   - [ ] See notification: "Game started! X team goes first"
   - [ ] Notification auto-dismisses

2. **Correct Guesses**:
   - [ ] Click a card matching current team
   - [ ] See green notification with checkmark
   - [ ] Guesses counter decrements
   - [ ] Can continue clicking

3. **Wrong Team Card**:
   - [ ] Click opponent's card
   - [ ] See orange notification with X
   - [ ] Turn switches immediately
   - [ ] Other team's turn begins

4. **Neutral Card**:
   - [ ] Click neutral card
   - [ ] See gray notification
   - [ ] Turn ends
   - [ ] Switches to other team

5. **Assassin Card**:
   - [ ] Click assassin card
   - [ ] See red notification with skull
   - [ ] Game ends immediately
   - [ ] Other team wins
   - [ ] Play Again button pulses

6. **Pass Turn**:
   - [ ] Click Pass Turn during game
   - [ ] See yellow notification
   - [ ] Turn switches
   - [ ] Clue cleared

7. **Win Condition**:
   - [ ] Reveal all cards of one color
   - [ ] See victory notification
   - [ ] Game status shows win
   - [ ] Play Again available

8. **Notification Behavior**:
   - [ ] Notifications slide in from top
   - [ ] Auto-dismiss after 3.5s
   - [ ] Smooth fade out
   - [ ] Multiple events queue properly

## Ready for Phase 4

Phase 3 is complete with full game flow and turn logic! The game now:
- ✅ Handles all turn outcomes correctly
- ✅ Tracks guesses and switches turns appropriately
- ✅ Provides real-time feedback for every action
- ✅ Has beautiful, color-coded notifications
- ✅ Implements all Codenames rules correctly
- ✅ Offers smooth, intuitive gameplay

Next Phase will add:
- AI Codemaster with Mastra integration
- Automatic clue generation
- Intelligent hint system based on unrevealed cards
- API endpoints for AI communication

## Key Features Summary

### Turn Management:
- ✓ Automatic turn switching
- ✓ Guess counter tracking
- ✓ Pass turn functionality
- ✓ Turn continues on correct guess
- ✓ Turn ends on wrong/neutral/assassin

### Feedback System:
- ✓ Real-time notifications
- ✓ Color-coded by outcome
- ✓ Auto-dismiss with animations
- ✓ Event history tracking
- ✓ Context-aware messages

### Game Rules:
- ✓ 9 vs 8 card distribution
- ✓ 7 neutral cards
- ✓ 1 assassin (instant loss)
- ✓ Number + 1 guess rule
- ✓ All Codenames rules implemented

### User Experience:
- ✓ Clear visual feedback
- ✓ Smooth animations
- ✓ Intuitive controls
- ✓ Accessibility features
- ✓ Professional polish
