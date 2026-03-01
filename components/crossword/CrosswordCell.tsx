"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CrosswordCellProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  isActive: boolean;
  isBlocked: boolean;
  isCorrect?: boolean | null;
  isHighlighted?: boolean;
  number?: number | null;
}

export const CrosswordCell = forwardRef<HTMLInputElement, CrosswordCellProps>(
  function CrosswordCell(
    {
      value,
      onChange,
      onKeyDown,
      onFocus,
      isActive,
      isBlocked,
      isCorrect,
      isHighlighted,
      number,
    },
    ref
  ) {
    if (isBlocked) {
      return (
        <div 
          className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-lg border-2 border-gray-700"
          aria-hidden="true"
        />
      );
    }

    return (
      <div className="relative">
        {number && (
          <span className="absolute -top-1 -left-1 w-5 h-5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center justify-center shadow-sm z-10">
            {number}
          </span>
        )}
        <input
          ref={ref}
          type="text"
          maxLength={1}
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 text-center text-xl sm:text-2xl font-bold uppercase rounded-lg border-2 outline-none transition-all duration-200",
            "focus:ring-4 focus:ring-blue-300",
            isActive && "border-blue-500 bg-blue-50 ring-4 ring-blue-200",
            isHighlighted && !isActive && "border-purple-300 bg-purple-50",
            isCorrect === true && "border-green-500 bg-green-100 text-green-700",
            isCorrect === false && "border-red-400 bg-red-50 text-red-600",
            isCorrect === null && !isActive && !isHighlighted && "border-gray-300 bg-white text-gray-800 hover:border-gray-400"
          )}
        />
      </div>
    );
  }
);
