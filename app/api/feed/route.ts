import { NextRequest, NextResponse } from "next/server";
import { getFeed } from "@/lib/yahoo-feed";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;
    const data = await getFeed(cursor);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
