"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface WordDisplayProps {
  word: string;
  guessedLetters: Set<string>;
  gameStatus: "playing" | "won" | "lost";
}

export function WordDisplay({ word, guessedLetters, gameStatus }: WordDisplayProps) {
  const letters = word.split("");

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <AnimatePresence mode="popLayout">
        {letters.map((letter, index) => {
          const isSpace = letter === " ";
          const isGuessed = guessedLetters.has(letter);
          const showLetter = isGuessed || gameStatus === "lost";
          const isWrong = gameStatus === "lost" && !isGuessed && !isSpace;

          if (isSpace) {
            return (
              <motion.div
                key={`space-${index}`}
                className="w-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            );
          }

          return (
            <motion.div
              key={`${letter}-${index}`}
              layout
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                delay: index * 0.03,
              }}
              className={cn(
                "relative flex items-center justify-center w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 transition-all duration-300",
                showLetter
                  ? isWrong
                    ? "border-red-400 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
                    : "border-emerald-400 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                  : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50"
              )}
            >
              <AnimatePresence mode="wait">
                {showLetter ? (
                  <motion.span
                    key="revealed"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                    }}
                    className={cn(
                      "text-2xl sm:text-3xl font-bold",
                      isWrong
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {letter}
                  </motion.span>
                ) : (
                  <motion.span
                    key="hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-slate-300 dark:text-slate-600 text-xl font-bold"
                  >
                    ?
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Underline effect */}
              <motion.div
                className={cn(
                  "absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300",
                  showLetter
                    ? isWrong
                      ? "w-0 bg-red-400"
                      : "w-0 bg-emerald-400"
                    : "w-6 bg-slate-300 dark:bg-slate-600"
                )}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
