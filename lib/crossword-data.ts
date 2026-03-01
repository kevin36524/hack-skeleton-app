// Kid-friendly crossword puzzles
export interface CrosswordWord {
  number: number;
  direction: "across" | "down";
  row: number;
  col: number;
  answer: string;
  clue: string;
}

export interface CrosswordPuzzle {
  title: string;
  description: string;
  gridSize: number;
  words: CrosswordWord[];
}

// Sample puzzles for kids - with properly intersecting words
export const puzzles: CrosswordPuzzle[] = [
  {
    title: "Animals",
    description: "Find the names of cute animals!",
    gridSize: 7,
    words: [
      // Across words
      { number: 1, direction: "across", row: 0, col: 0, answer: "CAT", clue: "A furry pet that says 'meow'" },
      { number: 3, direction: "across", row: 2, col: 0, answer: "DOG", clue: "A loyal pet that says 'woof'" },
      { number: 5, direction: "across", row: 4, col: 0, answer: "COW", clue: "Gives us milk" },
      { number: 6, direction: "across", row: 6, col: 0, answer: "BEAR", clue: "Big and furry, loves honey" },
      // Down words - intersecting at specific letters
      { number: 2, direction: "down", row: 0, col: 2, answer: "TIGER", clue: "Big cat with stripes" },
      { number: 4, direction: "down", row: 2, col: 1, answer: "OWL", clue: "A wise bird" },
    ],
  },
  {
    title: "Colors",
    description: "Find the rainbow colors!",
    gridSize: 8,
    words: [
      // Across words
      { number: 1, direction: "across", row: 0, col: 0, answer: "RED", clue: "Color of apples" },
      { number: 3, direction: "across", row: 2, col: 0, answer: "BLUE", clue: "Color of the sky" },
      { number: 5, direction: "across", row: 4, col: 0, answer: "PINK", clue: "Color of flamingos" },
      { number: 7, direction: "across", row: 6, col: 0, answer: "GOLD", clue: "Shiny yellow color" },
      // Down words
      { number: 2, direction: "down", row: 0, col: 2, answer: "GREEN", clue: "Color of grass" },
      { number: 4, direction: "down", row: 2, col: 3, answer: "LIME", clue: "Bright green citrus" },
      { number: 6, direction: "down", row: 4, col: 1, answer: "ORANGE", clue: "Color of oranges" },
    ],
  },
  {
    title: "Space",
    description: "Explore the universe!",
    gridSize: 8,
    words: [
      // Across words
      { number: 1, direction: "across", row: 0, col: 0, answer: "SUN", clue: "Bright star in our sky" },
      { number: 3, direction: "across", row: 2, col: 0, answer: "MOON", clue: "Shines at night" },
      { number: 5, direction: "across", row: 4, col: 0, answer: "MARS", clue: "The red planet" },
      { number: 7, direction: "across", row: 6, col: 0, answer: "STAR", clue: "Twinkles in the sky" },
      // Down words
      { number: 2, direction: "down", row: 0, col: 2, answer: "SPACE", clue: "Where astronauts go" },
      { number: 4, direction: "down", row: 2, col: 3, answer: "ROCKET", clue: "Flies to space" },
      { number: 6, direction: "down", row: 4, col: 1, answer: "ALIEN", clue: "Creature from another planet" },
    ],
  },
];

// Generate empty grid
export function generateEmptyGrid(size: number): string[][] {
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill(""));
}

// Create a grid with blocked cells (where no letters go)
export function createPuzzleGrid(puzzle: CrosswordPuzzle): { grid: string[][]; numbers: (number | null)[][] } {
  const size = puzzle.gridSize;
  const grid = generateEmptyGrid(size);
  const numbers = Array(size)
    .fill(null)
    .map(() => Array(size).fill(null));

  // Mark cells that should have letters
  for (const word of puzzle.words) {
    // Place number marker at the start of the word
    if (numbers[word.row][word.col] === null) {
      numbers[word.row][word.col] = word.number;
    }

    // Fill in the answer (for validation)
    for (let i = 0; i < word.answer.length; i++) {
      if (word.direction === "across") {
        grid[word.row][word.col + i] = word.answer[i];
      } else {
        grid[word.row + i][word.col] = word.answer[i];
      }
    }
  }

  return { grid, numbers };
}

// Check if a cell is part of a word
export function isActiveCell(row: number, col: number, puzzle: CrosswordPuzzle): boolean {
  for (const word of puzzle.words) {
    if (word.direction === "across") {
      if (row === word.row && col >= word.col && col < word.col + word.answer.length) {
        return true;
      }
    } else {
      if (col === word.col && row >= word.row && row < word.row + word.answer.length) {
        return true;
      }
    }
  }
  return false;
}

// Get word numbers for a cell (returns the word number if this cell is a start of a word)
export function getCellNumbers(row: number, col: number, puzzle: CrosswordPuzzle): number[] {
  const nums: number[] = [];
  for (const word of puzzle.words) {
    if (word.row === row && word.col === col) {
      nums.push(word.number);
    }
  }
  return nums;
}

// Get all words that cover a specific cell
export function getWordsAtCell(row: number, col: number, puzzle: CrosswordPuzzle): CrosswordWord[] {
  const words: CrosswordWord[] = [];
  for (const word of puzzle.words) {
    if (word.direction === "across") {
      if (row === word.row && col >= word.col && col < word.col + word.answer.length) {
        words.push(word);
      }
    } else {
      if (col === word.col && row >= word.row && row < word.row + word.answer.length) {
        words.push(word);
      }
    }
  }
  return words;
}
