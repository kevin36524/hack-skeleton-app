'use client';

import { useState } from 'react';

type Player = 'X' | 'O' | null;

export default function Home() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  const checkWinner = (currentBoard: Player[]): Player | 'Draw' | null => {
    // Check for winner
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }

    // Check for draw
    if (currentBoard.every(cell => cell !== null)) {
      return 'Draw';
    }

    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans">
      <main className="flex flex-col items-center justify-center p-8">
        <h1 className="text-5xl font-bold mb-8 text-gray-800 dark:text-white">
          Tic Tac Toe
        </h1>

        <div className="mb-6 text-center">
          {winner ? (
            <div className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
              {winner === 'Draw' ? (
                <span className="text-yellow-600 dark:text-yellow-400">It's a Draw!</span>
              ) : (
                <span className="text-green-600 dark:text-green-400">Player {winner} Wins!</span>
              )}
            </div>
          ) : (
            <div className="text-xl text-gray-600 dark:text-gray-300">
              Current Player: <span className="font-bold text-blue-600 dark:text-blue-400">{currentPlayer}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              className={`
                w-24 h-24 text-4xl font-bold rounded-lg shadow-lg
                transition-all duration-200 transform hover:scale-105
                ${cell
                  ? 'bg-white dark:bg-gray-700'
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                }
                ${cell === 'X' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}
                ${!cell && !winner ? 'cursor-pointer' : 'cursor-not-allowed'}
                disabled:opacity-50
              `}
              disabled={!!cell || !!winner}
            >
              {cell}
            </button>
          ))}
        </div>

        <button
          onClick={resetGame}
          className="px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200"
        >
          New Game
        </button>

        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Click on any empty square to make your move</p>
        </div>
      </main>
    </div>
  );
}
