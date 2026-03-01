"use client";

import { useState, useCallback } from "react";
import { CrosswordPuzzle, puzzles as staticPuzzles } from "@/lib/crossword-data";
import { CrosswordGrid } from "@/components/crossword/CrosswordGrid";
import { ClueList } from "@/components/crossword/ClueList";
import { ScoreBoard } from "@/components/crossword/ScoreBoard";
import { PuzzleSelector } from "@/components/crossword/PuzzleSelector";
import { Sparkles, RotateCcw, Eye, EyeOff, Wand2, Loader2 } from "lucide-react";

export default function CrosswordPage() {
  const [currentPuzzle, setCurrentPuzzle] = useState<CrosswordPuzzle>(staticPuzzles[0]);
  const [score, setScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState<number | undefined>();
  const [isComplete, setIsComplete] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dynamicPuzzles, setDynamicPuzzles] = useState<CrosswordPuzzle[]>([]);
  const [selectedTheme, setSelectedTheme] = useState("");

  const handleComplete = useCallback((newScore: number, time: number) => {
    setScore(newScore);
    setTimeTaken(time);
    setIsComplete(true);
  }, []);

  const handleReset = () => {
    setScore(0);
    setTimeTaken(undefined);
    setIsComplete(false);
    setShowAnswers(false);
    setGameKey((prev) => prev + 1);
  };

  const handleSelectPuzzle = (puzzle: CrosswordPuzzle) => {
    setCurrentPuzzle(puzzle);
    handleReset();
  };

  const generateDynamicPuzzle = async (theme?: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/crossword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: theme || selectedTheme || undefined }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate puzzle");
      }

      const data = await response.json();
      
      if (data.success && data.puzzle) {
        const puzzleData: CrosswordPuzzle = {
          title: data.puzzle.title,
          description: data.puzzle.description || `A fun ${data.puzzle.title.toLowerCase()} puzzle!`,
          gridSize: data.puzzle.gridSize,
          words: data.puzzle.words.map((w: CrosswordPuzzle["words"][0]) => ({
            number: w.number,
            direction: w.direction,
            row: w.row,
            col: w.col,
            answer: w.answer.toUpperCase(),
            clue: w.clue,
          })),
        };
        
        setDynamicPuzzles((prev) => [...prev, puzzleData]);
        setCurrentPuzzle(puzzleData);
        handleReset();
      } else {
        throw new Error(data.error || "Invalid puzzle data");
      }
    } catch (error) {
      console.error("Error generating puzzle:", error);
      alert("Failed to generate puzzle. Please try again!");
    } finally {
      setIsGenerating(false);
    }
  };

  // Combine static and dynamic puzzles
  const allPuzzles = [...staticPuzzles, ...dynamicPuzzles];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Kids Crossword
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-gray-600 text-lg">Solve puzzles and generate new ones with AI!</p>
        </header>

        {/* AI Puzzle Generator */}
        <div className="mb-6 bg-white rounded-2xl p-4 shadow-lg border-2 border-purple-200">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 text-purple-700 font-semibold">
              <Wand2 className="w-5 h-5" />
              <span>AI Puzzle Generator:</span>
            </div>
            <div className="flex-1 flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Enter a theme (e.g., 'dinosaurs', 'sports')..."
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isGenerating && generateDynamicPuzzle()}
                className="flex-1 px-4 py-2 rounded-full border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-gray-700"
              />
              <button
                onClick={() => generateDynamicPuzzle()}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center sm:text-left">
            Or leave empty for a random surprise theme! ✨
          </p>
        </div>

        {/* Puzzle Selector */}
        <div className="mb-8">
          <PuzzleSelector
            currentPuzzle={currentPuzzle}
            onSelectPuzzle={handleSelectPuzzle}
            customPuzzles={allPuzzles}
          />
        </div>

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Clues */}
          <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
            <ClueList
              words={currentPuzzle.words}
              direction="across"
              title="Across"
            />
            <ClueList
              words={currentPuzzle.words}
              direction="down"
              title="Down"
            />
          </div>

          {/* Center: Grid */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-purple-200">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-purple-700">
                  {currentPuzzle.title}
                </h2>
                <p className="text-gray-500">{currentPuzzle.description}</p>
              </div>
              <CrosswordGrid
                key={gameKey}
                puzzle={currentPuzzle}
                onComplete={handleComplete}
                showAnswers={showAnswers}
              />
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3 mt-4 flex-wrap">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full font-medium transition-colors"
              >
                {showAnswers ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Hide Answers
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Show Answers
                  </>
                )}
              </button>
              <button
                onClick={() => generateDynamicPuzzle()}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full font-medium hover:from-yellow-500 hover:to-orange-500 transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                New Puzzle
              </button>
            </div>
          </div>

          {/* Right: Score */}
          <div className="lg:col-span-1 order-3">
            <ScoreBoard
              score={score}
              timeTaken={timeTaken}
              isComplete={isComplete}
            />

            {/* Instructions */}
            <div className="mt-4 bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
              <h3 className="font-bold text-blue-700 mb-2">How to Play:</h3>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Click a cell to start typing</li>
                <li>• Use arrow keys to move around</li>
                <li>• Press Space to switch direction</li>
                <li>• Fill all words to complete!</li>
              </ul>
            </div>

            {/* AI Badge */}
            {dynamicPuzzles.includes(currentPuzzle) && (
              <div className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 border-2 border-purple-200">
                <div className="flex items-center gap-2 text-purple-700">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-bold">AI-Generated Puzzle!</span>
                </div>
                <p className="text-sm text-purple-600 mt-1">
                  This puzzle was created just for you by our AI crossword creator!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
