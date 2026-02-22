"use client";

import { useState, useEffect, useCallback } from "react";
import { HangmanFigure } from "@/components/hangman-figure";
import { WordDisplay } from "@/components/word-display";
import { Keyboard } from "@/components/keyboard";
import { GameStatus } from "@/components/game-status";
import { Confetti } from "@/components/confetti";
import { WORD_LIST, getRandomWord } from "@/lib/words";
import { RotateCcw, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_WRONG_GUESSES = 6;

export default function HangmanGame() {
  const [word, setWord] = useState("");
  const [category, setCategory] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Initialize game
  const initGame = useCallback(() => {
    const { word: newWord, category: newCategory } = getRandomWord();
    setWord(newWord.toUpperCase());
    setCategory(newCategory);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameStatus("playing");
    setShowConfetti(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Check for win/lose conditions
  useEffect(() => {
    if (!word) return;

    const wordLetters = word.split("").filter((l) => l !== " ");
    const uniqueLetters = new Set(wordLetters);
    const guessedCorrect = Array.from(uniqueLetters).every((letter) =>
      guessedLetters.has(letter)
    );

    if (guessedCorrect && uniqueLetters.size > 0) {
      setGameStatus("won");
      setScore((s) => s + Math.max(10, 100 - wrongGuesses * 10));
      setStreak((s) => s + 1);
      setShowConfetti(true);
    } else if (wrongGuesses >= MAX_WRONG_GUESSES) {
      setGameStatus("lost");
      setStreak(0);
    }
  }, [guessedLetters, wrongGuesses, word]);

  // Handle letter guess
  const handleGuess = useCallback(
    (letter: string) => {
      if (gameStatus !== "playing") return;
      if (guessedLetters.has(letter)) return;

      const newGuessed = new Set(guessedLetters);
      newGuessed.add(letter);
      setGuessedLetters(newGuessed);

      if (!word.includes(letter)) {
        setWrongGuesses((w) => w + 1);
      }
    },
    [gameStatus, guessedLetters, word]
  );

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        handleGuess(key);
      } else if (e.key === "Enter" && gameStatus !== "playing") {
        initGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleGuess, gameStatus, initGame]);

  // Dark mode detection
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-500">
      {showConfetti && <Confetti />}
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Hangman
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Guess the word
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {score}
              </span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25 animate-pulse">
                <span className="font-bold">🔥 {streak}</span>
              </div>
            )}
          </div>
        </header>

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Hangman Figure */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-sm aspect-square rounded-3xl bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 p-6">
              <HangmanFigure wrongGuesses={wrongGuesses} />
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {category}
                </span>
              </div>
              
              {/* Lives Counter */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: MAX_WRONG_GUESSES }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-6 rounded-full transition-all duration-300",
                        i < wrongGuesses
                          ? "bg-red-500 scale-95"
                          : "bg-emerald-400 shadow-lg shadow-emerald-400/50"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Word & Keyboard */}
          <div className="flex flex-col gap-6">
            {/* Word Display */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[180px] rounded-3xl bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 p-8">
              <WordDisplay
                word={word}
                guessedLetters={guessedLetters}
                gameStatus={gameStatus}
              />
            </div>

            {/* Keyboard */}
            <div className="rounded-3xl bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 p-6">
              <Keyboard
                guessedLetters={guessedLetters}
                word={word}
                onGuess={handleGuess}
                disabled={gameStatus !== "playing"}
              />
            </div>
          </div>
        </div>

        {/* Game Status Overlay */}
        {gameStatus !== "playing" && (
          <GameStatus
            status={gameStatus}
            word={word}
            onRestart={initGame}
          />
        )}

        {/* Instructions */}
        <footer className="mt-12 text-center text-slate-400 dark:text-slate-500 text-sm">
          <p>Press any letter key to guess • Enter to restart</p>
        </footer>
      </main>
    </div>
  );
}
