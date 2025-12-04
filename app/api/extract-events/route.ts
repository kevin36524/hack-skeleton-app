import { mastra } from "@/src/mastra";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const instructions = formData.get("instructions") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const mimeType = file.type;

    // Get the calendar event extractor agent
    const agent = mastra.getAgent("calendarEventExtractor");

    if (!agent) {
      return NextResponse.json(
        { error: "Calendar event extractor agent not found" },
        { status: 500 }
      );
    }

    // Prepare the message with image and optional custom instructions
    const userMessage = instructions
      ? `${instructions}\n\nPlease extract all calendar events from this image and return them in JSON format.`
      : "Please extract all calendar events from this image and return them in JSON format.";

    // Generate response from the agent
    const response = await agent.generate([
      {
        role: "user",
        content: [
          {
            type: "image",
            image: `data:${mimeType};base64,${base64Image}`,
          },
          {
            type: "text",
            text: userMessage,
          },
        ],
      },
    ]);

    // Parse the response text as JSON
    let events;
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        events = JSON.parse(jsonMatch[0]);
      } else {
        events = JSON.parse(response.text);
      }
    } catch (parseError) {
      console.error("Failed to parse agent response:", response.text);
      return NextResponse.json(
        {
          error: "Failed to parse calendar events",
          rawResponse: response.text,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      events: events.events || [],
      rawResponse: response.text,
    });
  } catch (error) {
    console.error("Error extracting calendar events:", error);
    return NextResponse.json(
      {
        error: "Failed to extract calendar events",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
