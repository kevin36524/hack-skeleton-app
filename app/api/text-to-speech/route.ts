import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';
import { elevenLabsTTSTool } from '@/src/mastra/tools/elevenlabs-tts-tool';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voiceId, modelId, stability, similarityBoost } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    // Execute the ElevenLabs TTS tool
    const result = await (elevenLabsTTSTool.execute as any)({
      inputData: {
        text,
        voiceId,
        modelId,
        stability,
        similarityBoost,
      },
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Text-to-speech API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to convert text to speech',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
