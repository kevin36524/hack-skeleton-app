import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '../../../src/mastra';

const agent = mastra.getAgent('digestPrefsAgent');

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { prefs, query } = body;

    if (!query) {
      return NextResponse.json({ error: 'Missing required field: query' }, { status: 400 });
    }

    const prompt = `Current prefs:
${JSON.stringify(prefs ?? {}, null, 2)}

User request: ${query}

Return the updated prefs JSON.`;

    const result = await agent.generate(prompt);
    const text = result.text.trim();

    // Parse and re-serialize to validate JSON
    let updatedPrefs: unknown;
    try {
      updatedPrefs = JSON.parse(text);
    } catch {
      // Try extracting JSON from the response in case of extra text
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        return NextResponse.json({ error: 'Agent returned invalid JSON', raw: text }, { status: 500 });
      }
      updatedPrefs = JSON.parse(match[0]);
    }

    return NextResponse.json({ prefs: updatedPrefs });
  } catch (error) {
    console.error('[digest-prefs] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
