"use client";

import { CrosswordWord } from "@/lib/crossword-data";
import { cn } from "@/lib/utils";

interface ClueListProps {
  words: CrosswordWord[];
  direction: "across" | "down";
  title: string;
  activeNumber?: number | null;
  onClueClick?: (word: CrosswordWord) => void;
}

export function ClueList({ words, direction, title, activeNumber, onClueClick }: ClueListProps) {
  const filteredWords = words.filter((w) => w.direction === direction);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-purple-100">
      <h3 className="text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
        <span className="text-2xl">{direction === "across" ? "→" : "↓"}</span>
        {title}
      </h3>
      <ul className="space-y-2">
        {filteredWords.map((word) => (
          <li
            key={`${direction}-${word.number}`}
            onClick={() => onClueClick?.(word)}
            className={cn(
              "p-3 rounded-xl cursor-pointer transition-all duration-200",
              "hover:bg-purple-50",
              activeNumber === word.number
                ? "bg-purple-100 border-2 border-purple-300 shadow-md"
                : "border-2 border-transparent bg-gray-50"
            )}
          >
            <span className="inline-flex items-center justify-center w-7 h-7 bg-yellow-400 text-yellow-900 text-sm font-bold rounded-full mr-2">
              {word.number}
            </span>
            <span className="text-gray-700">{word.clue}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
