import { NextRequest, NextResponse } from "next/server";
import { mastra } from "@/src/mastra";

interface AdIdea {
  headline: string;
  concept: string;
  visualDescription: string;
  tone: string;
  ctaSuggestion: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, originalIdea, comment }: {
      product: string;
      originalIdea: AdIdea;
      comment: string;
    } = body;

    if (!product || !originalIdea || !comment?.trim()) {
      return NextResponse.json(
        { error: "product, originalIdea, and comment are required" },
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

    const prompt = `You are refining a single existing ad idea based on user feedback.

Product: ${product}

Original idea:
- Headline: ${originalIdea.headline}
- Concept: ${originalIdea.concept}
- Visual Description: ${originalIdea.visualDescription}
- Tone: ${originalIdea.tone}
- CTA: ${originalIdea.ctaSuggestion}

User feedback: "${comment}"

Return a single improved ad idea that addresses the feedback. Keep what worked, fix what didn't.
Return ONLY raw JSON (no markdown, no backticks) in this exact shape:

{
  "headline": "...",
  "concept": "...",
  "visualDescription": "...",
  "tone": "...",
  "ctaSuggestion": "..."
}`;

    const response = await agent.generate([{ role: "user", content: prompt }]);

    let rawText = response.text || "";
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      rawText = jsonMatch[1].trim();
    } else {
      rawText = rawText.replace(/```/g, "").trim();
    }

    let refinedIdea: AdIdea;
    try {
      refinedIdea = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse agent response", raw: response.text },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, idea: refinedIdea });
  } catch (error) {
    console.error("Ad Idea Refine API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to refine idea",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
