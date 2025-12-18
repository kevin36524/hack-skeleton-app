import { Card, Team } from '../types/game';

export interface AIClueResponse {
  clue: string;
  number: number;
  reasoning?: string;
}

/**
 * Generates a clue using the AI Codemaster
 */
export async function generateAIClue(
  board: Card[],
  currentTeam: Team
): Promise<AIClueResponse> {
  try {
    const response = await fetch('/api/generate-clue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        board,
        currentTeam,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate clue');
    }

    const data: AIClueResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling AI service:', error);
    throw error;
  }
}
