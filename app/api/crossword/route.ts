import { mastra } from "@/src/mastra";
import { NextResponse } from "next/server";
import { CrosswordPuzzle } from "@/lib/crossword-data";

export async function POST(request: Request) {
  try {
    const { theme } = await request.json();
    
    const agent = mastra.getAgent("crosswordAgent");
    
    const prompt = theme 
      ? `Create a fun crossword puzzle for kids about "${theme}". Return ONLY valid JSON format with 5-8 words that intersect properly.`
      : "Create a fun crossword puzzle for kids with a random theme. Return ONLY valid JSON format with 5-8 words that intersect properly.";
    
    const response = await agent.generate(prompt);
    
    // Parse the JSON response from the agent
    let puzzleData: CrosswordPuzzle;
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      let jsonText = response.text;
      
      // Remove markdown code blocks if present
      if (jsonText.includes("```json")) {
        jsonText = jsonText.replace(/```json\n?/, "").replace(/\n?```/, "");
      } else if (jsonText.includes("```")) {
        jsonText = jsonText.replace(/```\n?/, "").replace(/\n?```/, "");
      }
      
      // Trim whitespace
      jsonText = jsonText.trim();
      
      puzzleData = JSON.parse(jsonText);
      
      // Validate the parsed data has required fields
      if (!puzzleData.title || !puzzleData.words || !Array.isArray(puzzleData.words)) {
        throw new Error("Invalid puzzle data structure");
      }
      
    } catch (parseError) {
      console.error("Failed to parse agent response as JSON:", response.text);
      console.error("Parse error:", parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to parse puzzle data",
          rawResponse: response.text 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      puzzle: puzzleData,
      theme: theme || "random"
    });
  } catch (error) {
    console.error("Error generating crossword:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to generate crossword puzzle" 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return a simple message for GET requests
  return NextResponse.json({ 
    message: "Crossword API - POST to generate a new puzzle"
  });
}
