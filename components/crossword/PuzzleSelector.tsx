"use client";

import { CrosswordPuzzle, puzzles } from "@/lib/crossword-data";
import { cn } from "@/lib/utils";
import { Puzzle, Palette, Rocket } from "lucide-react";

interface PuzzleSelectorProps {
  currentPuzzle: CrosswordPuzzle;
  onSelectPuzzle: (puzzle: CrosswordPuzzle) => void;
}

const icons = {
  "Animals": Puzzle,
  "Colors": Palette,
  "Space": Rocket,
};

const colors = {
  "Animals": "from-green-400 to-emerald-500",
  "Colors": "from-pink-400 to-rose-500",
  "Space": "from-blue-400 to-indigo-500",
};

export function PuzzleSelector({ currentPuzzle, onSelectPuzzle }: PuzzleSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {puzzles.map((puzzle) => {
        const Icon = icons[puzzle.title as keyof typeof icons] || Puzzle;
        const isActive = currentPuzzle.title === puzzle.title;
        
        return (
          <button
            key={puzzle.title}
            onClick={() => onSelectPuzzle(puzzle)}
            className={cn(
              "relative p-4 rounded-2xl transition-all duration-300",
              "bg-gradient-to-br shadow-lg",
              colors[puzzle.title as keyof typeof colors] || "from-gray-400 to-gray-500",
              isActive
                ? "scale-105 ring-4 ring-white/50 shadow-2xl"
                : "hover:scale-102 hover:shadow-xl opacity-80 hover:opacity-100"
            )}
          >
            <div className="flex flex-col items-center text-white">
              <Icon className="w-10 h-10 mb-2" />
              <h3 className="text-lg font-bold">{puzzle.title}</h3>
              <p className="text-xs text-white/80 mt-1">{puzzle.description}</p>
            </div>
            {isActive && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                <span className="text-yellow-900 text-lg">★</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
