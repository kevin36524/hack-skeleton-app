import { mastra } from "@/src/mastra";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Get the form data with the uploaded image
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Convert the file to base64
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

    // Call the agent with the image
    const response = await agent.generate(
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract all calendar event information from this image and return it in the specified JSON format.",
            },
            {
              type: "image",
              image: `data:${mimeType};base64,${base64Image}`,
            },
          ],
        },
      ],
      {
        maxSteps: 1,
      }
    );

    // Extract the text response
    const extractedText = response.text || "";

    // Try to parse JSON from the response
    let calendarEvents;
    try {
      // Try to find JSON in the response
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        calendarEvents = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, return the raw text
        calendarEvents = { rawResponse: extractedText };
      }
    } catch (parseError) {
      // If JSON parsing fails, return the raw response
      calendarEvents = { rawResponse: extractedText };
    }

    return NextResponse.json({
      success: true,
      data: calendarEvents,
      rawResponse: extractedText,
    });
  } catch (error) {
    console.error("Error extracting calendar event:", error);
    return NextResponse.json(
      {
        error: "Failed to extract calendar event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
