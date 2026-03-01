"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CrosswordPuzzle, createPuzzleGrid, isActiveCell, getCellNumbers } from "@/lib/crossword-data";
import { CrosswordCell } from "./CrosswordCell";
import { cn } from "@/lib/utils";

interface CrosswordGridProps {
  puzzle: CrosswordPuzzle;
  onComplete: (score: number, timeTaken: number) => void;
  showAnswers: boolean;
}

type Direction = "across" | "down";

export function CrosswordGrid({ puzzle, onComplete, showAnswers }: CrosswordGridProps) {
  const size = puzzle.gridSize;
  const { grid: solutionGrid, numbers } = createPuzzleGrid(puzzle);
  
  const [userGrid, setUserGrid] = useState<string[][]>(() => 
    Array(size).fill(null).map(() => Array(size).fill(""))
  );
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [direction, setDirection] = useState<Direction>("across");
  const [checkedCells, setCheckedCells] = useState<Set<string>>(new Set());
  const [startTime] = useState<number>(Date.now());
  const [isComplete, setIsComplete] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array(size).fill(null).map(() => Array(size).fill(null))
  );

  // Get the current word that contains the active cell
  const getCurrentWord = useCallback((row: number, col: number, dir: Direction) => {
    for (const word of puzzle.words) {
      if (word.direction !== dir) continue;
      if (dir === "across") {
        if (row === word.row && col >= word.col && col < word.col + word.answer.length) {
          return word;
        }
      } else {
        if (col === word.col && row >= word.row && row < word.row + word.answer.length) {
          return word;
        }
      }
    }
    return null;
  }, [puzzle.words]);

  // Check if a cell is part of the current word
  const isInCurrentWord = useCallback((row: number, col: number) => {
    if (!activeCell) return false;
    const currentWord = getCurrentWord(activeCell.row, activeCell.col, direction);
    if (!currentWord) return false;
    
    if (direction === "across") {
      return row === currentWord.row && col >= currentWord.col && col < currentWord.col + currentWord.answer.length;
    } else {
      return col === currentWord.col && row >= currentWord.row && row < currentWord.row + currentWord.answer.length;
    }
  }, [activeCell, direction, getCurrentWord]);

  // Move to next cell
  const moveToNext = useCallback((row: number, col: number, dir: Direction) => {
    const currentWord = getCurrentWord(row, col, dir);
    if (!currentWord) return;

    let nextRow = row;
    let nextCol = col;

    if (dir === "across") {
      nextCol++;
      if (nextCol >= currentWord.col + currentWord.answer.length) {
        return;
      }
    } else {
      nextRow++;
      if (nextRow >= currentWord.row + currentWord.answer.length) {
        return;
      }
    }

    if (isActiveCell(nextRow, nextCol, puzzle)) {
      inputRefs.current[nextRow][nextCol]?.focus();
    }
  }, [getCurrentWord, puzzle]);

  // Move to previous cell
  const moveToPrevious = useCallback((row: number, col: number, dir: Direction) => {
    const currentWord = getCurrentWord(row, col, dir);
    if (!currentWord) return;

    let prevRow = row;
    let prevCol = col;

    if (dir === "across") {
      prevCol--;
      if (prevCol < currentWord.col) return;
    } else {
      prevRow--;
      if (prevRow < currentWord.row) return;
    }

    if (isActiveCell(prevRow, prevCol, puzzle)) {
      inputRefs.current[prevRow][prevCol]?.focus();
    }
  }, [getCurrentWord, puzzle]);

  const handleCellChange = (row: number, col: number, value: string) => {
    if (!/^[A-Z]?$/.test(value)) return;

    const newGrid = userGrid.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? value : c))
    );
    setUserGrid(newGrid);

    if (value && activeCell) {
      moveToNext(row, col, direction);
    }
  };

  const handleKeyDown = (row: number, col: number, e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        if (direction === "down") {
          setDirection("across");
        } else {
          const nextCol = col + 1;
          if (nextCol < size && isActiveCell(row, nextCol, puzzle)) {
            inputRefs.current[row][nextCol]?.focus();
          }
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (direction === "down") {
          setDirection("across");
        } else {
          const prevCol = col - 1;
          if (prevCol >= 0 && isActiveCell(row, prevCol, puzzle)) {
            inputRefs.current[row][prevCol]?.focus();
          }
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (direction === "across") {
          setDirection("down");
        } else {
          const nextRow = row + 1;
          if (nextRow < size && isActiveCell(nextRow, col, puzzle)) {
            inputRefs.current[nextRow][col]?.focus();
          }
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (direction === "across") {
          setDirection("down");
        } else {
          const prevRow = row - 1;
          if (prevRow >= 0 && isActiveCell(prevRow, col, puzzle)) {
            inputRefs.current[prevRow][col]?.focus();
          }
        }
        break;
      case "Backspace":
        if (!userGrid[row][col]) {
          e.preventDefault();
          moveToPrevious(row, col, direction);
        }
        break;
      case " ":
        e.preventDefault();
        setDirection((d) => (d === "across" ? "down" : "across"));
        break;
      case "Tab":
        e.preventDefault();
        // Move to next word
        const currentIdx = puzzle.words.findIndex(
          (w) => w.direction === direction && getCurrentWord(row, col, direction)?.number === w.number
        );
        const nextWord = puzzle.words[currentIdx + 1] || puzzle.words[0];
        inputRefs.current[nextWord.row][nextWord.col]?.focus();
        setDirection(nextWord.direction);
        break;
    }
  };

  const checkAnswers = () => {
    const newChecked = new Set<string>();
    let allCorrect = true;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (isActiveCell(row, col, puzzle)) {
          const key = `${row}-${col}`;
          newChecked.add(key);
          if (userGrid[row][col] !== solutionGrid[row][col]) {
            allCorrect = false;
          }
        }
      }
    }

    setCheckedCells(newChecked);

    if (allCorrect && !isComplete) {
      setIsComplete(true);
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      // Calculate score based on time and accuracy
      const baseScore = 1000;
      const timeBonus = Math.max(0, 300 - timeTaken) * 2;
      const totalScore = baseScore + timeBonus;
      onComplete(totalScore, timeTaken);
    }
  };

  const getCellStatus = (row: number, col: number): boolean | null => {
    if (!checkedCells.has(`${row}-${col}`) && !showAnswers) return null;
    if (!isActiveCell(row, col, puzzle)) return null;
    return userGrid[row][col] === solutionGrid[row][col];
  };

  // Find first active cell on mount
  useEffect(() => {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (isActiveCell(row, col, puzzle)) {
          setActiveCell({ row, col });
          return;
        }
      }
    }
  }, [puzzle, size]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="inline-grid gap-1 p-4 bg-gray-100 rounded-2xl shadow-inner"
        style={{ 
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: size }, (_, row) =>
          Array.from({ length: size }, (_, col) => {
            const active = isActiveCell(row, col, puzzle);
            const cellNumber = numbers[row][col];

            return (
              <CrosswordCell
                key={`${row}-${col}`}
                ref={(el) => {
                  inputRefs.current[row][col] = el;
                }}
                value={showAnswers ? solutionGrid[row][col] : userGrid[row][col]}
                onChange={(value) => handleCellChange(row, col, value)}
                onKeyDown={(e) => handleKeyDown(row, col, e)}
                onFocus={() => {
                  setActiveCell({ row, col });
                }}
                isActive={activeCell?.row === row && activeCell?.col === col}
                isBlocked={!active}
                isCorrect={getCellStatus(row, col)}
                isHighlighted={isInCurrentWord(row, col)}
                number={cellNumber}
              />
            );
          })
        )}
      </div>

      {!showAnswers && (
        <button
          onClick={checkAnswers}
          className={cn(
            "px-8 py-3 rounded-full font-bold text-lg transition-all duration-200 shadow-lg",
            "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
            "hover:from-green-600 hover:to-emerald-600 hover:scale-105",
            "active:scale-95"
          )}
        >
          Check Answers! ✓
        </button>
      )}
    </div>
  );
}
