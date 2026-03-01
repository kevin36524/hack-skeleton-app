import { CrosswordPuzzle, CrosswordWord } from "./crossword-data";

/**
 * Parses AI-generated crossword text into a structured CrosswordPuzzle
 */
export function parseCrosswordPuzzle(aiResponse: string): CrosswordPuzzle {
  const lines = aiResponse.split("\n").map(line => line.trim()).filter(Boolean);
  
  let title = "Dynamic Puzzle";
  let description = "AI-generated crossword puzzle!";
  const words: CrosswordWord[] = [];
  
  let parsingWords = false;
  let wordNumber = 1;
  
  for (const line of lines) {
    // Extract theme/title
    if (line.toLowerCase().startsWith("theme:") || line.toLowerCase().startsWith("**theme:**")) {
      title = line.replace(/\*\*?theme:\*\*?/i, "").trim();
      continue;
    }
    
    // Skip section headers
    if (line.includes("**") && (line.toLowerCase().includes("grid") || line.toLowerCase().includes("answer"))) {
      parsingWords = false;
      continue;
    }
    
    // Start parsing words
    if (line.toLowerCase().includes("words") && line.toLowerCase().includes("clues")) {
      parsingWords = true;
      continue;
    }
    
    // Parse word entries (format: "1. WORD - Clue" or "1. WORD - Clue")
    if (parsingWords) {
      const match = line.match(/^\d*\.?\s*([A-Za-z]+)\s*[-–—]\s*(.+)$/);
      if (match) {
        const [, word, clue] = match;
        words.push({
          number: wordNumber,
          direction: wordNumber % 2 === 0 ? "down" : "across", // Alternate directions
          row: 0,
          col: 0,
          answer: word.toUpperCase(),
          clue: clue.trim()
        });
        wordNumber++;
      }
    }
  }
  
  // Calculate grid size based on longest word
  const longestWord = Math.max(...words.map(w => w.answer.length), 5);
  const gridSize = Math.min(Math.max(longestWord + 2, 8), 15);
  
  // Position words in the grid
  positionWordsInGrid(words, gridSize);
  
  return {
    title,
    description,
    gridSize,
    words
  };
}

/**
 * Simple algorithm to position words in a grid
 * Tries to create intersections where possible
 */
function positionWordsInGrid(words: CrosswordWord[], gridSize: number): void {
  if (words.length === 0) return;
  
  // Place first word in the center, horizontally
  const firstWord = words[0];
  firstWord.direction = "across";
  firstWord.row = Math.floor(gridSize / 2);
  firstWord.col = Math.floor((gridSize - firstWord.answer.length) / 2);
  
  // Track placed letters for potential intersections
  const placedLetters: Map<string, { row: number; col: number }[]> = new Map();
  
  // Add first word's letters
  for (let i = 0; i < firstWord.answer.length; i++) {
    const letter = firstWord.answer[i];
    const key = letter;
    if (!placedLetters.has(key)) {
      placedLetters.set(key, []);
    }
    placedLetters.get(key)!.push({
      row: firstWord.row,
      col: firstWord.col + i
    });
  }
  
  // Try to place remaining words with intersections
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const isAcross = i % 2 === 0;
    word.direction = isAcross ? "across" : "down";
    
    let placed = false;
    
    // Try to find an intersection with already placed words
    for (let letterIndex = 0; letterIndex < word.answer.length && !placed; letterIndex++) {
      const letter = word.answer[letterIndex];
      const existingPositions = placedLetters.get(letter);
      
      if (existingPositions) {
        for (const pos of existingPositions) {
          // Calculate where this word would start to intersect at this letter
          let startRow, startCol;
          
          if (isAcross) {
            startRow = pos.row;
            startCol = pos.col - letterIndex;
            // Check if word fits horizontally
            if (startCol < 0 || startCol + word.answer.length > gridSize) continue;
          } else {
            startRow = pos.row - letterIndex;
            startCol = pos.col;
            // Check if word fits vertically
            if (startRow < 0 || startRow + word.answer.length > gridSize) continue;
          }
          
          // Check for conflicts
          if (!hasConflict(word, startRow, startCol, isAcross, words.slice(0, i), gridSize)) {
            word.row = startRow;
            word.col = startCol;
            placed = true;
            
            // Add this word's letters to placedLetters
            for (let j = 0; j < word.answer.length; j++) {
              const l = word.answer[j];
              if (!placedLetters.has(l)) {
                placedLetters.set(l, []);
              }
              placedLetters.get(l)!.push({
                row: isAcross ? startRow : startRow + j,
                col: isAcross ? startCol + j : startCol
              });
            }
            break;
          }
        }
      }
    }
    
    // If no intersection found, place word in an empty area
    if (!placed) {
      placeWordWithoutIntersection(word, words.slice(0, i), gridSize, i);
      
      // Add letters to placedLetters
      const isWordAcross = word.direction === "across";
      for (let j = 0; j < word.answer.length; j++) {
        const l = word.answer[j];
        if (!placedLetters.has(l)) {
          placedLetters.set(l, []);
        }
        placedLetters.get(l)!.push({
          row: isWordAcross ? word.row : word.row + j,
          col: isWordAcross ? word.col + j : word.col
        });
      }
    }
  }
}

/**
 * Check if placing a word would cause conflicts
 */
function hasConflict(
  word: CrosswordWord,
  startRow: number,
  startCol: number,
  isAcross: boolean,
  placedWords: CrosswordWord[],
  gridSize: number
): boolean {
  for (let i = 0; i < word.answer.length; i++) {
    const row = isAcross ? startRow : startRow + i;
    const col = isAcross ? startCol + i : startCol;
    
    // Check bounds
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
      return true;
    }
    
    // Check against placed words
    for (const placed of placedWords) {
      const placedIsAcross = placed.direction === "across";
      
      for (let j = 0; j < placed.answer.length; j++) {
        const placedRow = placedIsAcross ? placed.row : placed.row + j;
        const placedCol = placedIsAcross ? placed.col + j : placed.col;
        
        if (row === placedRow && col === placedCol) {
          // Same position - check if letters match
          if (word.answer[i] !== placed.answer[j]) {
            return true; // Conflict!
          }
        }
      }
    }
  }
  
  return false;
}

/**
 * Place a word without intersection (as a last resort)
 */
function placeWordWithoutIntersection(
  word: CrosswordWord,
  placedWords: CrosswordWord[],
  gridSize: number,
  index: number
): void {
  const isAcross = word.direction === "across";
  
  // Try different positions
  for (let attempt = 0; attempt < gridSize * 2; attempt++) {
    const row = isAcross 
      ? Math.floor(gridSize / 2) + (attempt % 2 === 0 ? -1 : 1) * Math.ceil(attempt / 2)
      : Math.floor((gridSize - word.answer.length) / 2);
    const col = isAcross
      ? Math.floor((gridSize - word.answer.length) / 2)
      : Math.floor(gridSize / 2) + (attempt % 2 === 0 ? -1 : 1) * Math.ceil(attempt / 2);
    
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) continue;
    if (isAcross && col + word.answer.length > gridSize) continue;
    if (!isAcross && row + word.answer.length > gridSize) continue;
    
    if (!hasConflict(word, row, col, isAcross, placedWords, gridSize)) {
      word.row = Math.max(0, Math.min(row, gridSize - 1));
      word.col = Math.max(0, Math.min(col, gridSize - 1));
      return;
    }
  }
  
  // Fallback: place at a default position
  word.row = isAcross ? index * 2 : 0;
  word.col = isAcross ? 0 : index * 2;
}
