import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const inputSchema = z.object({
  text: z.string().describe('The text to convert to speech'),
  voiceId: z.string().optional().default('21m00Tcm4TlvDq8ikWAM').describe('ElevenLabs voice ID. Default is Rachel voice.'),
  modelId: z.string().optional().default('eleven_monolingual_v1').describe('ElevenLabs model ID'),
  stability: z.number().min(0).max(1).optional().default(0.5).describe('Voice stability (0-1)'),
  similarityBoost: z.number().min(0).max(1).optional().default(0.75).describe('Similarity boost (0-1)'),
});

export const elevenLabsTTSTool = createTool({
  id: 'elevenlabs-text-to-speech',
  description: 'Converts text to speech using ElevenLabs API. Returns audio data as base64 encoded string that can be played or saved as an audio file.',
  inputSchema,
  outputSchema: z.object({
    audioBase64: z.string().describe('Base64 encoded audio data'),
    contentType: z.string().describe('Audio content type (e.g., audio/mpeg)'),
    textLength: z.number().describe('Length of input text'),
    voiceId: z.string().describe('Voice ID used'),
  }),
  execute: async (input: z.infer<typeof inputSchema>) => {
    const { text, voiceId, modelId, stability, similarityBoost } = input;

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY environment variable is not set');
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: modelId,
            voice_settings: {
              stability,
              similarity_boost: similarityBoost,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');

      return {
        audioBase64,
        contentType: 'audio/mpeg',
        textLength: text.length,
        voiceId,
      };
    } catch (error) {
      throw new Error(`Failed to convert text to speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});
