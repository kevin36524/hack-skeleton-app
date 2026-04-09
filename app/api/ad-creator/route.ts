import { NextRequest, NextResponse } from "next/server";
import { mastra } from "@/src/mastra";

interface ReferenceImage {
  url?: string;
  base64?: string;
  mimeType?: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      referenceText,
      referenceImages,
    }: {
      message: string;
      referenceText?: string;
      referenceImages?: ReferenceImage[];
    } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    const agent = mastra.getAgent("adCreator");

    if (!agent) {
      return NextResponse.json(
        { error: "Ad Creator agent not found" },
        { status: 500 }
      );
    }

    // Build text content
    let textContent = message;
    
    const contextParts: string[] = [];
    
    if (referenceText) {
      contextParts.push(`Reference Text:\n${referenceText}`);
    }
    
    // Add image descriptions as context
    if (referenceImages && referenceImages.length > 0) {
      const imageDescriptions = referenceImages
        .map((img, index) => {
          const parts: string[] = [];
          parts.push(`[Image ${index + 1}]`);
          if (img.description) parts.push(`Description: ${img.description}`);
          return parts.join("\n");
        })
        .join("\n\n");
      
      contextParts.push(`Reference Images:\n${imageDescriptions}`);
    }
    
    if (contextParts.length > 0) {
      textContent = `${message}\n\n---\n${contextParts.join("\n\n")}`;
    }

    // Build message content with images for vision model
    const content: any[] = [{ type: "text", text: textContent }];
    
    // Add images as image content parts for the vision model
    if (referenceImages && referenceImages.length > 0) {
      for (const img of referenceImages) {
        if (img.base64) {
          // Extract mime type from base64 data URL or use provided one
          let mimeType = img.mimeType || "image/jpeg";
          let base64Data = img.base64;
          
          // If base64 includes data URL prefix, extract it
          if (base64Data.includes(',')) {
            const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              mimeType = match[1];
              base64Data = match[2];
            }
          }
          
          content.push({
            type: "image",
            image: base64Data,
            mimeType: mimeType,
          });
        } else if (img.url) {
          content.push({
            type: "image",
            image: img.url,
          });
        }
      }
    }

    const response = await agent.generate({ message: content });

    return NextResponse.json({
      success: true,
      ad: response.text,
    });
  } catch (error) {
    console.error("Ad Creator API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate ad",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const agent = mastra.getAgent("adCreator");
    return NextResponse.json({
      status: "ok",
      agent: agent ? "available" : "unavailable",
      agentName: agent?.name,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Agent not available" },
      { status: 500 }
    );
  }
}
