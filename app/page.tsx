"use client";

import { useState, useCallback } from "react";

type Player = "X" | "O" | null;
type Board = Player[];

function calculateWinner(board: Board): Player {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<Player>(null);
  const [isDraw, setIsDraw] = useState(false);

  const handleCellClick = useCallback(
    (index: number) => {
      if (board[index] || winner || isDraw) return;

      const newBoard = [...board];
      newBoard[index] = currentPlayer;
      setBoard(newBoard);

      const gameWinner = calculateWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
      } else if (isBoardFull(newBoard)) {
        setIsDraw(true);
      } else {
        setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
      }
    },
    [board, currentPlayer, winner, isDraw]
  );

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setIsDraw(false);
  }, []);

  const getStatusMessage = () => {
    if (winner) {
      return `Winner: ${winner}!`;
    }
    if (isDraw) {
      return "It's a draw!";
    }
    return `Current player: ${currentPlayer}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
          Tic Tac Toe
        </h1>

        <div className="text-xl font-medium text-zinc-700 dark:text-zinc-300">
          {getStatusMessage()}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className="flex h-24 w-24 items-center justify-center rounded-lg bg-white text-4xl font-bold shadow-sm transition-all hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
              disabled={!!cell || !!winner || isDraw}
            >
              <span
                className={
                  cell === "X"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                {cell}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={resetGame}
          className="rounded-full bg-zinc-900 px-6 py-3 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
