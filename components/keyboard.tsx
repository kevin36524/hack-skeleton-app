"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KeyboardProps {
  guessedLetters: Set<string>;
  word: string;
  onGuess: (letter: string) => void;
  disabled?: boolean;
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export function Keyboard({ guessedLetters, word, onGuess, disabled }: KeyboardProps) {
  const getKeyStatus = (letter: string): "default" | "correct" | "wrong" => {
    if (!guessedLetters.has(letter)) return "default";
    return word.includes(letter) ? "correct" : "wrong";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <motion.div
          key={rowIndex}
          className="flex gap-1 sm:gap-1.5 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: rowIndex * 0.1 }}
        >
          {rowIndex === 1 && <div className="w-4 sm:w-6" />} {/* Offset for middle row */}
          
          {row.map((letter) => {
            const status = getKeyStatus(letter);
            const isGuessed = guessedLetters.has(letter);

            return (
              <motion.button
                key={letter}
                onClick={() => onGuess(letter)}
                disabled={isGuessed || disabled}
                whileHover={!isGuessed && !disabled ? { scale: 1.1, y: -2 } : {}}
                whileTap={!isGuessed && !disabled ? { scale: 0.95 } : {}}
                className={cn(
                  "relative w-8 h-10 sm:w-10 sm:h-12 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800",
                  status === "default" && [
                    "bg-white dark:bg-slate-700",
                    "text-slate-700 dark:text-slate-200",
                    "border border-slate-200 dark:border-slate-600",
                    "shadow-sm hover:shadow-md",
                    "hover:bg-slate-50 dark:hover:bg-slate-600",
                    disabled && "opacity-50 cursor-not-allowed",
                  ],
                  status === "correct" && [
                    "bg-emerald-500 text-white",
                    "border border-emerald-600",
                    "shadow-lg shadow-emerald-500/30",
                    "cursor-default",
                  ],
                  status === "wrong" && [
                    "bg-slate-200 dark:bg-slate-700",
                    "text-slate-400 dark:text-slate-500",
                    "border border-slate-300 dark:border-slate-600",
                    "cursor-default",
                  ]
                )}
              >
                {letter}
                
                {/* Status indicator dot */}
                {status !== "default" && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2",
                      status === "correct"
                        ? "bg-emerald-300 border-emerald-500"
                        : "bg-slate-400 border-slate-300 dark:border-slate-600"
                    )}
                  />
                )}
              </motion.button>
            );
          })}
          
          {rowIndex === 1 && <div className="w-4 sm:w-6" />} {/* Offset for middle row */}
        </motion.div>
      ))}
    </div>
  );
}
