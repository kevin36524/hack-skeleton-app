"use client";

import { useState } from "react";

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

function Square({
  value,
  onClick,
}: {
  value: Player;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="h-20 w-20 border-2 border-gray-300 text-4xl font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
    >
      {value && (
        <span className={value === "X" ? "text-blue-500" : "text-red-500"}>
          {value}
        </span>
      )}
    </button>
  );
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every((square) => square !== null);

  const status = winner
    ? `Winner: ${winner}`
    : isDraw
    ? "It's a draw!"
    : `Next player: ${xIsNext ? "X" : "O"}`;

  function handleClick(index: number) {
    if (board[index] || winner) return;

    const newBoard = board.slice();
    newBoard[index] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Tic Tac Toe
        </h1>

        <div
          className={`text-center mb-6 text-lg font-medium ${
            winner
              ? "text-green-600 dark:text-green-400"
              : isDraw
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {status}
        </div>

        <div className="grid grid-cols-3 gap-1 mb-6">
          {board.map((value, index) => (
            <Square
              key={index}
              value={value}
              onClick={() => handleClick(index)}
            />
          ))}
        </div>

        <button
          onClick={resetGame}
          className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
