"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, RotateCcw, Sparkles, Star, Zap } from "lucide-react";

interface Question {
  num1: number;
  num2: number;
  correctAnswer: number;
  options: number[];
}

function generateQuestion(): Question {
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  const correctAnswer = num1 * num2;

  // Generate wrong answers
  const wrongAnswers: number[] = [];
  while (wrongAnswers.length < 2) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const wrong = correctAnswer + offset;
    if (wrong !== correctAnswer && wrong > 0 && !wrongAnswers.includes(wrong)) {
      wrongAnswers.push(wrong);
    }
  }

  const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

  return { num1, num2, correctAnswer, options };
}

const TOTAL_QUESTIONS = 10;
const MAX_TIME = 10; // Maximum time per question in seconds

export default function MultiplicationQuiz() {
  const [gameState, setGameState] = useState<"start" | "playing" | "answered" | "finished">("start");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [lastPointsEarned, setLastPointsEarned] = useState<number | null>(null);

  const startGame = () => {
    setGameState("playing");
    setQuestionNumber(1);
    setScore(0);
    setCurrentQuestion(generateQuestion());
    setTimeLeft(MAX_TIME);
  };

  const handleAnswer = (answer: number) => {
    if (gameState !== "playing" || !currentQuestion) return;

    setSelectedAnswer(answer);
    setGameState("answered");

    if (answer === currentQuestion.correctAnswer) {
      // Score equals remaining time (1-7 points)
      const pointsEarned = Math.max(1, Math.ceil(timeLeft));
      setLastPointsEarned(pointsEarned);
      setScore((prev) => prev + pointsEarned);
    } else {
      setLastPointsEarned(0);
    }

    setTimeout(() => {
      if (questionNumber >= TOTAL_QUESTIONS) {
        setGameState("finished");
      } else {
        setQuestionNumber((prev) => prev + 1);
        setCurrentQuestion(generateQuestion());
        setSelectedAnswer(null);
        setLastPointsEarned(null);
        setGameState("playing");
        setTimeLeft(MAX_TIME);
      }
    }, 1500);
  };

  // Timer effect
  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(-1); // Time's up, wrong answer
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, questionNumber]);

  const getScoreMessage = () => {
    const percentage = (score / TOTAL_QUESTIONS) * 100;
    if (percentage === 100) return "Perfect Score! You're a Math Wizard! 🧙‍♂️";
    if (percentage >= 80) return "Excellent work! Almost perfect! 🌟";
    if (percentage >= 60) return "Great job! Keep practicing! 💪";
    if (percentage >= 40) return "Good effort! Room for improvement! 📚";
    return "Keep practicing! You'll get better! 🌱";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -100],
              opacity: [0.2, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold">Math Challenge</h1>
              </div>
              {gameState !== "start" && gameState !== "finished" && (
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <span className="font-bold">{score} pts</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Start Screen */}
              {gameState === "start" && (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block mb-6"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl">
                      <Zap className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Ready to Test Your Skills?
                  </h2>
                  <p className="text-gray-600 mb-4 text-lg">
                    Answer {TOTAL_QUESTIONS} single-digit multiplication questions!
                  </p>
                  <div className="bg-violet-50 rounded-xl p-4 mb-8">
                    <p className="text-violet-700 font-medium">
                      ⏱️ Score = Seconds Remaining
                    </p>
                    <p className="text-violet-600 text-sm">
                      Answer faster to earn more points! (Max 10 points per question)
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-lg"
                  >
                    Start Quiz
                  </motion.button>
                </motion.div>
              )}

              {/* Question Screen */}
              {(gameState === "playing" || gameState === "answered") && currentQuestion && (
                <motion.div
                  key="question"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                >
                  {/* Progress */}
                  <div className="mb-8">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Question {questionNumber} of {TOTAL_QUESTIONS}</span>
                      <span>{Math.round((questionNumber / TOTAL_QUESTIONS) * 100)}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(questionNumber / TOTAL_QUESTIONS) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="flex justify-center mb-8">
                    <div className="relative">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#e5e7eb"
                          strokeWidth="6"
                          fill="none"
                        />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke={timeLeft <= 2 ? "#ef4444" : "#8b5cf6"}
                          strokeWidth="6"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${(timeLeft / MAX_TIME) * 226} 226`}
                          transition={{ duration: 0.1 }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-700">
                        {Math.ceil(timeLeft)}
                      </span>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="text-center mb-10">
                    <motion.div
                      key={questionNumber}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-6xl font-bold text-gray-800 mb-2"
                    >
                      {currentQuestion.num1} × {currentQuestion.num2}
                    </motion.div>
                    <p className="text-gray-500 text-lg">What is the answer?</p>
                  </div>

                  {/* Points Earned Indicator */}
                  <AnimatePresence>
                    {gameState === "answered" && lastPointsEarned !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`text-center mb-6 font-bold text-xl ${
                          lastPointsEarned > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {lastPointsEarned > 0 ? (
                          <>+{lastPointsEarned} points! 🎉</>
                        ) : (
                          <>Time's up! No points 😢</>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-4">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrect = option === currentQuestion.correctAnswer;
                      const showCorrect = gameState === "answered" && isCorrect;
                      const showWrong = gameState === "answered" && isSelected && !isCorrect;

                      return (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={gameState === "playing" ? { scale: 1.02 } : {}}
                          whileTap={gameState === "playing" ? { scale: 0.98 } : {}}
                          onClick={() => handleAnswer(option)}
                          disabled={gameState === "answered"}
                          className={`
                            relative py-5 px-8 rounded-2xl font-bold text-2xl transition-all duration-300
                            ${showCorrect
                              ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                              : showWrong
                              ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                              : isSelected
                              ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                            }
                          `}
                        >
                          <span className="flex items-center justify-center gap-3">
                            {option}
                            {showCorrect && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-white"
                              >
                                <CheckCircle2 className="w-8 h-8" />
                              </motion.span>
                            )}
                            {showWrong && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-white"
                              >
                                <XCircle className="w-8 h-8" />
                              </motion.span>
                            )}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Finished Screen */}
              {gameState === "finished" && (
                <motion.div
                  key="finished"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  {/* Confetti effect */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(30)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 rounded"
                        style={{
                          backgroundColor: ["#f472b6", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"][i % 5],
                          left: "50%",
                          top: "30%",
                        }}
                        animate={{
                          x: (Math.random() - 0.5) * 500,
                          y: (Math.random() - 0.5) * 500,
                          rotate: Math.random() * 720,
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration: 2,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="inline-block mb-6"
                  >
                    <div className="w-28 h-28 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-xl">
                      <Trophy className="w-14 h-14 text-white" />
                    </div>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold text-gray-800 mb-2"
                  >
                    Quiz Complete!
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 mb-6 text-lg"
                  >
                    {getScoreMessage()}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="bg-gradient-to-r from-violet-100 to-indigo-100 rounded-2xl p-6 mb-8"
                  >
                    <p className="text-gray-600 mb-2">Your Score</p>
                    <p className="text-5xl font-bold text-gray-800">
                      {score}
                    </p>
                    <p className="text-violet-600 font-semibold mt-2">
                      Max possible: {TOTAL_QUESTIONS * MAX_TIME} points
                    </p>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-lg flex items-center gap-3 mx-auto"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Play Again
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 mt-6 text-sm">
          Test your multiplication skills and have fun!
        </p>
      </motion.div>
    </div>
  );
}
