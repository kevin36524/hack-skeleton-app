import { NextRequest, NextResponse } from "next/server";
import { updateRSVP, deleteRSVP } from "@/lib/firebase/rsvp";
import { requireAdmin } from "@/lib/firebase/admin";
import type { RSVPInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;

  const { id } = await context.params;
  const body = (await request.json()) as Partial<RSVPInput>;

  if (body.attending && !["yes", "no"].includes(body.attending)) {
    return NextResponse.json({ error: "Invalid attending value" }, { status: 400 });
  }

  try {
    const patch: Partial<RSVPInput> = {};
    if (body.name !== undefined) patch.name = body.name.trim();
    if (body.attending !== undefined) {
      // Attendance flips reset the counts, so send them together.
      patch.attending = body.attending;
      patch.adults = body.attending === "yes" ? (body.adults ?? 1) : 0;
      patch.kids = body.attending === "yes" ? (body.kids ?? 0) : 0;
    } else {
      if (body.adults !== undefined) patch.adults = body.adults;
      if (body.kids !== undefined) patch.kids = body.kids;
    }
    if (body.message !== undefined) patch.message = body.message;

    await updateRSVP(id, patch);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RSVP update error:", error);
    return NextResponse.json({ error: "Failed to update RSVP" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;

  const { id } = await context.params;

  try {
    const deleted = await deleteRSVP(id);
    if (!deleted) {
      return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RSVP delete error:", error);
    return NextResponse.json({ error: "Failed to delete RSVP" }, { status: 500 });
  }
}
