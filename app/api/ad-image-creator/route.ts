import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface AdIdea {
  headline: string;
  concept: string;
  visualDescription: string;
  tone: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });

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

    const promptText = `Create a complete advertisement with an integrated image for the following:

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

Make sure the text is legible and the overall design is polished and professional.`;

    const contents: any[] = [{ text: promptText }];

    if (logoUrl) {
      contents.push({
        inlineData: {
          mimeType: "image/png",
          data: logoUrl.startsWith("data:")
            ? logoUrl.split(",")[1]
            : logoUrl,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ role: "user", parts: contents }],
      config: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    let imageData: string | undefined;
    let mimeType: string | undefined;
    let adText: string | undefined;

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData) {
        imageData = part.inlineData.data;
        mimeType = part.inlineData.mimeType;
      } else if (part.text) {
        adText = part.text;
      }
    }

    return NextResponse.json({
      success: true,
      ad: adText,
      image: imageData ? `data:${mimeType};base64,${imageData}` : undefined,
      mimeType,
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
  return NextResponse.json({
    status: "ok",
    model: "gemini-2.5-flash-image",
  });
}
