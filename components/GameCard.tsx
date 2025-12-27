'use client';

import { Card } from '@/lib/types/game';
import { useState } from 'react';

interface GameCardProps {
  card: Card;
  index: number;
  onReveal: (index: number) => void;
  disabled: boolean;
}

export function GameCard({ card, index, onReveal, disabled }: GameCardProps) {
  const [isFlipping, setIsFlipping] = useState(false);

  const handleClick = () => {
    if (disabled || card.revealed) return;

    setIsFlipping(true);
    setTimeout(() => {
      onReveal(index);
      setIsFlipping(false);
    }, 300);
  };

  // Determine card colors based on state
  const getCardColors = () => {
    if (!card.revealed) {
      return {
        bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
        text: 'text-gray-800',
        border: 'border-amber-200',
        shadow: 'shadow-md hover:shadow-lg',
        hover: 'hover:from-amber-100 hover:to-amber-200 hover:scale-105'
      };
    }

    switch (card.color) {
      case 'RED':
        return {
          bg: 'bg-gradient-to-br from-red-500 to-red-600',
          text: 'text-white',
          border: 'border-red-700',
          shadow: 'shadow-md',
          hover: ''
        };
      case 'BLUE':
        return {
          bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
          text: 'text-white',
          border: 'border-blue-700',
          shadow: 'shadow-md',
          hover: ''
        };
      case 'NEUTRAL':
        return {
          bg: 'bg-gradient-to-br from-gray-300 to-gray-400',
          text: 'text-gray-800',
          border: 'border-gray-500',
          shadow: 'shadow-md',
          hover: ''
        };
      case 'ASSASSIN':
        return {
          bg: 'bg-gradient-to-br from-black to-gray-900',
          text: 'text-white',
          border: 'border-red-900',
          shadow: 'shadow-xl shadow-red-900/50',
          hover: ''
        };
      default:
        return {
          bg: 'bg-gray-200',
          text: 'text-gray-800',
          border: 'border-gray-300',
          shadow: '',
          hover: ''
        };
    }
  };

  const colors = getCardColors();
  const isClickable = !disabled && !card.revealed;

  return (
    <button
      onClick={handleClick}
      disabled={disabled || card.revealed}
      className={`
        relative w-full h-full p-2 rounded-lg border-2
        font-bold text-sm
        transition-all duration-300 ease-out
        flex items-center justify-center text-center
        ${colors.bg}
        ${colors.text}
        ${colors.border}
        ${colors.shadow}
        ${isClickable ? colors.hover : ''}
        ${isClickable ? 'cursor-pointer active:scale-95' : 'cursor-default'}
        ${card.revealed ? 'opacity-90' : 'opacity-100'}
        ${isFlipping ? 'scale-95 rotate-y-180' : ''}
        disabled:cursor-not-allowed
        leading-tight
        transform-gpu
      `}
      aria-label={`${card.revealed ? `Revealed ${card.color} card` : 'Hidden card'}: ${card.word}`}
    >
      {/* Card Content */}
      <span className={`
        relative z-10 select-none
        ${isFlipping ? 'opacity-0' : 'opacity-100'}
        transition-opacity duration-150
        break-words hyphens-auto px-1
      `}>
        {card.word}
      </span>

      {/* Revealed indicator */}
      {card.revealed && (
        <div className="absolute inset-0 rounded-lg opacity-20 pointer-events-none">
          <div className="absolute inset-2 border border-white/50 rounded-md" />
        </div>
      )}

      {/* Assassin skull indicator */}
      {card.revealed && card.color === 'ASSASSIN' && (
        <div className="absolute top-1 right-1 text-red-500 text-xs">
          💀
        </div>
      )}

      {/* Team color indicator dots */}
      {card.revealed && (card.color === 'RED' || card.color === 'BLUE') && (
        <div className={`
          absolute top-1 right-1 w-2 h-2 rounded-full
          ${card.color === 'RED' ? 'bg-red-300' : 'bg-blue-300'}
        `} />
      )}
    </button>
  );
}
