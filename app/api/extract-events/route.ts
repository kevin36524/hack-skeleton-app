import { NextRequest, NextResponse } from "next/server";
import { mastra } from "@/src/mastra";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const mimeType = image.type;

    // Get the event extractor agent
    const agent = mastra.getAgent("eventExtractor");

    // Create the message with the image
    const response = await agent.generate(
      "Please analyze this image and extract all events you can find. Provide the information in a structured format with each event clearly labeled.",
      {
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this image and extract all events you can find. Provide the information in a structured format with each event clearly labeled.",
              },
              {
                type: "image",
                image: `data:${mimeType};base64,${base64Image}`,
              },
            ],
          },
        ],
      }
    );

    return NextResponse.json({
      success: true,
      extractedText: response.text || response.toString(),
      metadata: {
        filename: image.name,
        size: image.size,
        type: image.type,
      },
    });
  } catch (error) {
    console.error("Error extracting events:", error);
    return NextResponse.json(
      {
        error: "Failed to extract events",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
