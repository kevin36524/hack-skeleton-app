'use client';

import { GameEvent, TurnOutcome } from '@/lib/types/game';
import { useEffect, useState } from 'react';

interface GameNotificationProps {
  event: GameEvent | null;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

export function GameNotification({
  event,
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = 3000
}: GameNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setIsVisible(true);

      if (autoDismiss) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onDismiss?.();
          }, 300); // Wait for fade out animation
        }, autoDismissDelay);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [event, autoDismiss, autoDismissDelay, onDismiss]);

  if (!event) return null;

  const getNotificationStyle = (type: TurnOutcome) => {
    switch (type) {
      case 'CORRECT_TEAM':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-green-600',
          border: 'border-green-700',
          icon: '✓',
          textColor: 'text-white'
        };
      case 'WRONG_TEAM':
        return {
          bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
          border: 'border-orange-700',
          icon: '✗',
          textColor: 'text-white'
        };
      case 'NEUTRAL':
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          border: 'border-gray-700',
          icon: '○',
          textColor: 'text-white'
        };
      case 'ASSASSIN':
        return {
          bg: 'bg-gradient-to-r from-red-600 to-red-800',
          border: 'border-red-900',
          icon: '💀',
          textColor: 'text-white'
        };
      case 'WIN':
        return {
          bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
          border: 'border-purple-700',
          icon: '🎉',
          textColor: 'text-white'
        };
      case 'PASS':
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
          border: 'border-yellow-700',
          icon: '⏭️',
          textColor: 'text-white'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          border: 'border-blue-700',
          icon: 'ℹ',
          textColor: 'text-white'
        };
    }
  };

  const style = getNotificationStyle(event.type);

  return (
    <div
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
      `}
    >
      <div
        className={`
          ${style.bg} ${style.textColor}
          border-2 ${style.border}
          rounded-lg shadow-2xl
          px-6 py-3
          flex items-center gap-3
          max-w-md
          backdrop-blur-sm
        `}
      >
        {/* Icon */}
        <span className="text-2xl" role="img" aria-label={event.type}>
          {style.icon}
        </span>

        {/* Message */}
        <div className="flex-1">
          <p className="font-semibold text-sm leading-tight">
            {event.message}
          </p>
          {event.cardRevealed && (
            <p className="text-xs opacity-90 mt-0.5">
              Card: {event.cardRevealed}
            </p>
          )}
        </div>

        {/* Dismiss button (if not auto-dismissing) */}
        {!autoDismiss && onDismiss && (
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className="ml-2 text-white/80 hover:text-white transition-colors"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
