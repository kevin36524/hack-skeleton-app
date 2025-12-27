'use client';

import { Card } from '@/lib/types/game';
import { GameCard } from './GameCard';

interface GameBoardProps {
  cards: Card[];
  onRevealCard: (index: number) => void;
  disabled: boolean;
}

export function GameBoard({ cards, onRevealCard, disabled }: GameBoardProps) {
  if (cards.length !== 25) {
    console.warn(`Expected 25 cards, but received ${cards.length}`);
  }

  return (
    <div
      className="grid grid-cols-5 gap-2 w-full max-w-4xl mx-auto"
      role="grid"
      aria-label="Codenames game board"
    >
      {cards.map((card, index) => (
        <div key={index} role="gridcell" className="w-full" style={{ aspectRatio: '1 / 0.6' }}>
          <GameCard
            card={card}
            index={index}
            onReveal={onRevealCard}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
}
