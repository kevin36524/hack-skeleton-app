"use client";

import { CrosswordPuzzle, puzzles as staticPuzzles } from "@/lib/crossword-data";
import { cn } from "@/lib/utils";
import { Puzzle, Palette, Rocket, Sparkles, Wand2 } from "lucide-react";

interface PuzzleSelectorProps {
  currentPuzzle: CrosswordPuzzle;
  onSelectPuzzle: (puzzle: CrosswordPuzzle) => void;
  customPuzzles?: CrosswordPuzzle[];
}

const icons: Record<string, React.ElementType> = {
  "Animals": Puzzle,
  "Colors": Palette,
  "Space": Rocket,
};

const colors: Record<string, string> = {
  "Animals": "from-green-400 to-emerald-500",
  "Colors": "from-pink-400 to-rose-500",
  "Space": "from-blue-400 to-indigo-500",
};

export function PuzzleSelector({ currentPuzzle, onSelectPuzzle, customPuzzles = staticPuzzles }: PuzzleSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {customPuzzles.map((puzzle, index) => {
        const isStatic = index < staticPuzzles.length;
        const Icon = isStatic ? (icons[puzzle.title] || Puzzle) : Wand2;
        const isActive = currentPuzzle.title === puzzle.title;
        const colorClass = isStatic 
          ? (colors[puzzle.title] || "from-gray-400 to-gray-500")
          : "from-purple-400 to-pink-500";
        
        return (
          <button
            key={`${puzzle.title}-${index}`}
            onClick={() => onSelectPuzzle(puzzle)}
            className={cn(
              "relative p-3 rounded-2xl transition-all duration-300",
              "bg-gradient-to-br shadow-lg",
              colorClass,
              isActive
                ? "scale-105 ring-4 ring-white/50 shadow-2xl"
                : "hover:scale-102 hover:shadow-xl opacity-80 hover:opacity-100"
            )}
          >
            <div className="flex flex-col items-center text-white">
              <Icon className="w-8 h-8 mb-1" />
              <h3 className="text-sm font-bold truncate w-full text-center">{puzzle.title}</h3>
              <p className="text-xs text-white/80 mt-1 line-clamp-1">{puzzle.description}</p>
            </div>
            {isActive && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                <span className="text-yellow-900 text-lg">★</span>
              </div>
            )}
            {!isStatic && (
              <div className="absolute -top-1 -left-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
