import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';
import { Card, Team } from '@/lib/types/game';

interface GenerateClueRequest {
  board: Card[];
  currentTeam: Team;
}

interface ClueResponse {
  clue: string;
  number: number;
  reasoning?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateClueRequest = await req.json();
    const { board, currentTeam } = body;

    if (!board || !currentTeam) {
      return NextResponse.json(
        { error: 'Missing required fields: board, currentTeam' },
        { status: 400 }
      );
    }

    // Get the codemaster agent
    const agent = mastra.getAgent('codemaster');

    // Prepare the board information for the AI
    const teamWords = board
      .filter(card => !card.revealed && card.color === currentTeam)
      .map(card => card.word);

    const opponentTeam = currentTeam === 'RED' ? 'BLUE' : 'RED';
    const opponentWords = board
      .filter(card => !card.revealed && card.color === opponentTeam)
      .map(card => card.word);

    const neutralWords = board
      .filter(card => !card.revealed && card.color === 'NEUTRAL')
      .map(card => card.word);

    const assassinWords = board
      .filter(card => !card.revealed && card.color === 'ASSASSIN')
      .map(card => card.word);

    const revealedWords = board
      .filter(card => card.revealed)
      .map(card => card.word);

    const allBoardWords = board.map(card => card.word);

    // Create the prompt for the AI
    const prompt = `You are the Codemaster for the ${currentTeam} team in Codenames.

BOARD STATE:
All words on board: ${allBoardWords.join(', ')}

YOUR TEAM'S UNREVEALED WORDS (${currentTeam}): ${teamWords.join(', ')}
OPPONENT'S UNREVEALED WORDS (${opponentTeam}): ${opponentWords.join(', ')}
NEUTRAL WORDS: ${neutralWords.join(', ')}
ASSASSIN WORD (AVOID AT ALL COSTS): ${assassinWords.join(', ')}
ALREADY REVEALED: ${revealedWords.join(', ')}

Your task: Give a one-word clue and a number to help your team find their words.

RULES:
1. Your clue CANNOT be any word from the board (including revealed words)
2. Your clue must be ONE WORD only
3. The number indicates how many of YOUR TEAM's words relate to the clue
4. Avoid clues that might lead to opponent words, neutral words, or the assassin
5. Be strategic - sometimes it's better to connect 2 words safely than risk 4 words

Respond with ONLY a JSON object in this exact format:
{
  "clue": "WORD",
  "number": N,
  "reasoning": "brief explanation"
}`;

    // Generate the clue
    const response = await agent.generate(prompt);

    // Parse the JSON response
    let clueData: ClueResponse;
    try {
      // Extract JSON from the response text
      const text = response.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      clueData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', response.text);
      // Fallback to a safe default clue
      clueData = {
        clue: 'GAME',
        number: 1,
        reasoning: 'Failed to parse AI response, using fallback'
      };
    }

    // Validate the response
    if (!clueData.clue || typeof clueData.number !== 'number') {
      return NextResponse.json(
        { error: 'Invalid clue format from AI' },
        { status: 500 }
      );
    }

    // Ensure clue is uppercase and a single word
    clueData.clue = clueData.clue.toUpperCase().trim();

    // Validate clue is not on the board
    if (allBoardWords.includes(clueData.clue)) {
      console.warn('AI suggested a board word, using fallback');
      clueData = {
        clue: 'THING',
        number: 1,
        reasoning: 'AI suggested invalid word, using fallback'
      };
    }

    return NextResponse.json({
      clue: clueData.clue,
      number: clueData.number,
      reasoning: clueData.reasoning
    });

  } catch (error) {
    console.error('Error generating clue:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate clue',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
