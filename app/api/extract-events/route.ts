import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Determine the media type
    const mediaType = file.type || 'image/jpeg';

    // Get the calendar extractor agent
    const agent = mastra.getAgent('calendarExtractorAgent');

    // Create the message with the image
    const response = await agent.generate([
      {
        role: 'user',
        content: [
          {
            type: 'image',
            image: `data:${mediaType};base64,${base64Image}`,
          },
          {
            type: 'text',
            text: 'Please extract all calendar events from this image and provide the details in a structured format.',
          },
        ],
      },
    ]);

    return NextResponse.json({
      success: true,
      events: response.text,
      imagePreview: `data:${mediaType};base64,${base64Image}`,
    });
  } catch (error) {
    console.error('Error extracting events:', error);
    return NextResponse.json(
      {
        error: 'Failed to extract events from image',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
