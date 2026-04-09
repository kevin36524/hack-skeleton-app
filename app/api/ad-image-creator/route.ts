import { NextRequest, NextResponse } from "next/server";
import { mastra } from "@/src/mastra";

interface AdIdea {
  headline: string;
  concept: string;
  visualDescription: string;
  tone: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product,
      targetAudience,
      platform,
      adIdea,
      referenceText,
      brandColors,
      logoUrl,
    }: {
      product: string;
      targetAudience?: string;
      platform?: string;
      adIdea: AdIdea;
      referenceText?: string;
      brandColors?: string[];
      logoUrl?: string;
    } = body;

    if (!product || typeof product !== "string") {
      return NextResponse.json(
        { error: "Product is required and must be a string" },
        { status: 400 }
      );
    }

    if (!adIdea || typeof adIdea !== "object") {
      return NextResponse.json(
        { error: "Ad idea is required" },
        { status: 400 }
      );
    }

    const agent = mastra.getAgent("adImageCreator");

    if (!agent) {
      return NextResponse.json(
        { error: "Ad Image Creator agent not found" },
        { status: 500 }
      );
    }

    // Build the prompt for the image creator agent
    const contentParts: any[] = [
      {
        type: "text",
        text: `Create a complete advertisement with an integrated image for the following:

**Product/Service:** ${product}

**Selected Ad Concept:**
- Headline: "${adIdea.headline}"
- Concept: ${adIdea.concept}
- Visual Direction: ${adIdea.visualDescription}
- Tone: ${adIdea.tone}
${targetAudience ? `\n**Target Audience:** ${targetAudience}` : ""}
${platform ? `\n**Platform:** ${platform}` : ""}
${brandColors ? `\n**Brand Colors:** ${brandColors.join(", ")}` : ""}
${referenceText ? `\n**Additional Guidance:** ${referenceText}` : ""}

Please generate a complete ad image that includes:
1. The visual imagery described in the concept
2. The headline integrated into the design
3. Any supporting body text or call-to-action
4. Colors and styling that match the tone and brand guidelines

Make sure the text is legible and the overall design is polished and professional.`,
      },
    ];

    // Add logo if provided
    if (logoUrl) {
      contentParts.push({
        type: "image",
        image: logoUrl,
      });
    }

    const response = await agent.generate([{ role: "user", content: contentParts }]);

    return NextResponse.json({
      success: true,
      ad: response.text,
      // If the model returns an image, it would be in the response
      // For Gemini 3.1 Flash Image Preview, the image generation is part of the response
    });
  } catch (error) {
    console.error("Ad Image Creator API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate ad image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const agent = mastra.getAgent("adImageCreator");
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
