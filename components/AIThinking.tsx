'use client';

import { Team } from '@/lib/types/game';

interface AIThinkingProps {
  team: Team;
  isVisible: boolean;
}

export function AIThinking({ team, isVisible }: AIThinkingProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`
        bg-gradient-to-br ${team === 'RED' ? 'from-red-600 to-red-800' : 'from-blue-600 to-blue-800'}
        text-white rounded-2xl p-8 shadow-2xl max-w-md mx-4
        animate-pulse
      `}>
        <div className="flex flex-col items-center gap-4">
          {/* AI Icon */}
          <div className="text-6xl animate-bounce">
            🤖
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-center">
            AI Codemaster Thinking...
          </h3>

          {/* Description */}
          <p className="text-sm text-center text-white/90">
            Analyzing the board for {team} team
          </p>

          {/* Loading Dots */}
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>

          {/* Thinking Messages */}
          <div className="text-xs text-white/80 text-center space-y-1 mt-2">
            <p>📊 Analyzing unrevealed words...</p>
            <p>🎯 Calculating optimal connections...</p>
            <p>⚡ Generating strategic clue...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
