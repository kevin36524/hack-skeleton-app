"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HangmanFigureProps {
  wrongGuesses: number;
}

const bodyParts = [
  // Head
  {
    id: "head",
    render: (isVisible: boolean) => (
      <motion.circle
        cx="140"
        cy="80"
        r="25"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    ),
  },
  // Body
  {
    id: "body",
    render: (isVisible: boolean) => (
      <motion.line
        x1="140"
        y1="105"
        x2="140"
        y2="180"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    ),
  },
  // Left Arm
  {
    id: "leftArm",
    render: (isVisible: boolean) => (
      <motion.line
        x1="140"
        y1="125"
        x2="100"
        y2="155"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    ),
  },
  // Right Arm
  {
    id: "rightArm",
    render: (isVisible: boolean) => (
      <motion.line
        x1="140"
        y1="125"
        x2="180"
        y2="155"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    ),
  },
  // Left Leg
  {
    id: "leftLeg",
    render: (isVisible: boolean) => (
      <motion.line
        x1="140"
        y1="180"
        x2="105"
        y2="230"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    ),
  },
  // Right Leg
  {
    id: "rightLeg",
    render: (isVisible: boolean) => (
      <motion.line
        x1="140"
        y1="180"
        x2="175"
        y2="230"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    ),
  },
];

export function HangmanFigure({ wrongGuesses }: HangmanFigureProps) {
  const isGameOver = wrongGuesses >= 6;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 240 280"
        className={cn(
          "w-full h-full max-w-[280px] transition-colors duration-500",
          isGameOver ? "text-red-500" : "text-slate-700 dark:text-slate-300"
        )}
        fill="none"
      >
        {/* Gallows - Base */}
        <motion.line
          x1="20"
          y1="260"
          x2="100"
          y2="260"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
          className="text-slate-400 dark:text-slate-600"
        />
        
        {/* Gallows - Vertical Post */}
        <motion.line
          x1="60"
          y1="260"
          x2="60"
          y2="20"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-slate-400 dark:text-slate-600"
        />
        
        {/* Gallows - Top Beam */}
        <motion.line
          x1="60"
          y1="20"
          x2="140"
          y2="20"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-slate-400 dark:text-slate-600"
        />
        
        {/* Gallows - Rope */}
        <motion.line
          x1="140"
          y1="20"
          x2="140"
          y2="55"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="text-amber-600 dark:text-amber-700"
        />

        {/* Body Parts */}
        <AnimatePresence mode="wait">
          {bodyParts.slice(0, wrongGuesses).map((part, index) => (
            <g key={part.id}>{part.render(true)}</g>
          ))}
        </AnimatePresence>

        {/* Face - when game is lost */}
        {isGameOver && (
          <>
            {/* X eyes */}
            <motion.line
              x1="130"
              y1="72"
              x2="138"
              y2="80"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.line
              x1="138"
              y1="72"
              x2="130"
              y2="80"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.line
              x1="142"
              y1="72"
              x2="150"
              y2="80"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.line
              x1="150"
              y1="72"
              x2="142"
              y2="80"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2 }}
            />
            {/* Sad mouth */}
            <motion.path
              d="M 130 92 Q 140 85 150 92"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
          </>
        )}
      </svg>
    </div>
  );
}
