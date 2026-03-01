"use client";

import { useEffect, useState } from "react";
import { Trophy, Star, Clock, Target } from "lucide-react";

interface ScoreBoardProps {
  score: number;
  timeTaken?: number;
  isComplete: boolean;
}

export function ScoreBoard({ score, timeTaken, isComplete }: ScoreBoardProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isComplete) {
      setShowConfetti(true);
      // Animate score counting up
      const duration = 1500;
      const steps = 60;
      const increment = score / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= score) {
          setDisplayScore(score);
          clearInterval(timer);
        } else {
          setDisplayScore(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayScore(score);
    }
  }, [score, isComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate stars based on score
  const getStars = () => {
    if (score >= 1400) return 3;
    if (score >= 1100) return 2;
    return 1;
  };

  const stars = getStars();

  return (
    <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-6 shadow-lg border-2 border-yellow-300">
      {isComplete && showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            >
              {["🎉", "⭐", "🎊", "🏆", "✨"][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mb-4">
        <Trophy className="w-8 h-8 text-yellow-600" />
        <h2 className="text-2xl font-bold text-yellow-800">Score Board</h2>
      </div>

      <div className="text-center mb-4">
        <div className="text-5xl font-black text-yellow-600 drop-shadow-sm">
          {displayScore}
        </div>
        <div className="text-sm text-yellow-700 font-medium">points</div>
      </div>

      {isComplete && (
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              className={`w-10 h-10 transition-all duration-500 ${
                star <= stars
                  ? "fill-yellow-400 text-yellow-400 scale-100"
                  : "fill-gray-200 text-gray-200 scale-90"
              }`}
              style={{
                animationDelay: `${star * 200}ms`,
              }}
            />
          ))}
        </div>
      )}

      {timeTaken !== undefined && (
        <div className="flex items-center justify-center gap-2 text-gray-600 bg-white/50 rounded-xl py-2 px-4">
          <Clock className="w-5 h-5" />
          <span className="font-bold">{formatTime(timeTaken)}</span>
        </div>
      )}

      {isComplete && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full font-bold shadow-md">
            <Target className="w-5 h-5" />
            Puzzle Complete!
          </div>
        </div>
      )}
    </div>
  );
}
