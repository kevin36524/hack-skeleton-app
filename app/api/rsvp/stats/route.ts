import { NextResponse } from "next/server";
import { getRSVPStats } from "@/lib/firebase/rsvp";

export async function GET() {
  try {
    const stats = await getRSVPStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
