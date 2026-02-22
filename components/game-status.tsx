"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Trophy, Frown } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameStatusProps {
  status: "won" | "lost";
  word: string;
  onRestart: () => void;
}

export function GameStatus({ status, word, onRestart }: GameStatusProps) {
  const isWin = status === "won";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn(
            "relative w-full max-w-md rounded-3xl p-8 text-center shadow-2xl overflow-hidden",
            isWin
              ? "bg-gradient-to-br from-emerald-500 to-teal-600"
              : "bg-gradient-to-br from-slate-700 to-slate-800"
          )}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className={cn(
                "absolute -top-1/2 -right-1/2 w-full h-full rounded-full opacity-20",
                isWin ? "bg-white" : "bg-slate-500"
              )}
            />
            <motion.div
              animate={{
                rotate: -360,
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
              className={cn(
                "absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full opacity-20",
                isWin ? "bg-white" : "bg-slate-500"
              )}
            />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className={cn(
                "w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg",
                isWin
                  ? "bg-white text-emerald-500 shadow-emerald-900/30"
                  : "bg-slate-600 text-slate-200 shadow-slate-900/30"
              )}
            >
              {isWin ? (
                <Trophy className="w-12 h-12" />
              ) : (
                <Frown className="w-12 h-12" />
              )}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-white mb-2"
            >
              {isWin ? "You Won!" : "Game Over"}
            </motion.h2>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-lg mb-6"
            >
              {isWin
                ? "Congratulations! You guessed the word!"
                : "Better luck next time!"}
            </motion.p>

            {/* Word reveal (only on loss) */}
            {!isWin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <p className="text-white/60 text-sm mb-2">The word was:</p>
                <p className="text-2xl font-bold text-white tracking-wider">
                  {word}
                </p>
              </motion.div>
            )}

            {/* Restart Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRestart}
              className={cn(
                "inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 shadow-lg",
                isWin
                  ? "bg-white text-emerald-600 hover:bg-emerald-50 shadow-emerald-900/30"
                  : "bg-white text-slate-700 hover:bg-slate-50 shadow-slate-900/30"
              )}
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
