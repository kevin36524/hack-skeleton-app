import { NextRequest, NextResponse } from "next/server";
import { upsertRSVP, getRSVPStats, getAllRSVPs } from "@/lib/firebase/rsvp";
import { requireAdmin } from "@/lib/firebase/admin";
import type { RSVPInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: RSVPInput = await request.json();

    if (!body.name || !body.attending) {
      return NextResponse.json(
        { error: "Name and attending status are required" },
        { status: 400 }
      );
    }

    if (body.attending === "yes" && (body.adults < 1)) {
      return NextResponse.json(
        { error: "At least 1 adult is required if attending" },
        { status: 400 }
      );
    }

    const { rsvp, updated } = await upsertRSVP({
      name: body.name.trim(),
      email: body.email || null,
      photoURL: body.photoURL || null,
      authMethod: body.authMethod,
      attending: body.attending,
      adults: body.attending === "yes" ? body.adults : 0,
      kids: body.attending === "yes" ? body.kids : 0,
      message: body.message || "",
    });

    return NextResponse.json({ success: true, rsvp, updated }, { status: updated ? 200 : 201 });
  } catch (error) {
    console.error("RSVP creation error:", error);
    return NextResponse.json(
      { error: "Failed to submit RSVP" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;

  try {
    const [stats, rsvps] = await Promise.all([getRSVPStats(), getAllRSVPs()]);
    return NextResponse.json({ stats, rsvps });
  } catch (error) {
    console.error("RSVP fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch RSVPs" },
      { status: 500 }
    );
  }
}
