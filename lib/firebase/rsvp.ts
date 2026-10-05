import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "./admin";
import type { RSVP, RSVPInput, RSVPStats } from "@/lib/types";

const COLLECTION = "rsvps";

function docToRSVP(id: string, data: FirebaseFirestore.DocumentData): RSVP {
  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : (data.createdAt as string) || new Date().toISOString();
  const updatedAt =
    data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : (data.updatedAt as string) || new Date().toISOString();

  return {
    id,
    name: data.name as string,
    email: (data.email as string) || null,
    photoURL: (data.photoURL as string) || null,
    authMethod: data.authMethod as "google" | "name",
    attending: data.attending as "yes" | "no",
    adults: (data.adults as number) || 0,
    kids: (data.kids as number) || 0,
    message: (data.message as string) || "",
    createdAt,
    updatedAt,
  };
}

function normalizeEmail(email: string | null | undefined): string | null {
  const e = email?.trim().toLowerCase();
  return e || null;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * True when an incoming RSVP refers to the same person as a stored doc:
 * same email, or same name — except when both records carry *different*
 * emails (two different Google accounts can share a name).
 */
function isSamePerson(
  emailLower: string | null,
  nameLower: string,
  data: FirebaseFirestore.DocumentData
): boolean {
  const existingEmail = normalizeEmail(data.email as string | null);
  const existingName = normalizeName((data.name as string) || "");

  if (emailLower && existingEmail === emailLower) return true;
  if (existingName !== nameLower) return false;
  if (emailLower && existingEmail && existingEmail !== emailLower) return false;
  return true;
}

/**
 * Creates a new RSVP, or updates the existing one when the same person
 * (by email, or by name) already responded. The RSVP list is small enough
 * that an in-memory match is simplest and also covers docs written before
 * normalized fields existed.
 */
export async function upsertRSVP(
  input: RSVPInput
): Promise<{ rsvp: RSVP; updated: boolean }> {
  const emailLower = normalizeEmail(input.email);
  const nameLower = normalizeName(input.name);

  const snapshot = await adminDb.collection(COLLECTION).get();
  const match = snapshot.docs.find((d) =>
    isSamePerson(emailLower, nameLower, d.data())
  );

  if (match) {
    await match.ref.update({
      ...input,
      updatedAt: FieldValue.serverTimestamp(),
    });
    const existing = match.data();
    return {
      rsvp: {
        ...input,
        id: match.id,
        createdAt:
          existing.createdAt instanceof Timestamp
            ? existing.createdAt.toDate().toISOString()
            : (existing.createdAt as string) || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      updated: true,
    };
  }

  const now = FieldValue.serverTimestamp();
  const docRef = await adminDb.collection(COLLECTION).add({
    ...input,
    createdAt: now,
    updatedAt: now,
  });
  return {
    rsvp: {
      id: docRef.id,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    updated: false,
  };
}

export async function deleteRSVP(id: string): Promise<boolean> {
  const docRef = adminDb.collection(COLLECTION).doc(id);
  const snapshot = await docRef.get();
  if (!snapshot.exists) return false;
  await docRef.delete();
  return true;
}

export async function updateRSVP(
  id: string,
  input: Partial<RSVPInput>
): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).update({
    ...input,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function getRSVPByEmail(email: string): Promise<RSVP | null> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .where("email", "==", email)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return docToRSVP(doc.id, doc.data());
}

export async function getAllRSVPs(): Promise<RSVP[]> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => docToRSVP(doc.id, doc.data()));
}

export async function getRSVPStats(): Promise<RSVPStats> {
  const rsvps = await getAllRSVPs();
  const attending = rsvps.filter((r) => r.attending === "yes");

  return {
    totalResponses: rsvps.length,
    totalAttending: attending.length,
    totalDeclined: rsvps.filter((r) => r.attending === "no").length,
    totalAdults: attending.reduce((sum, r) => sum + r.adults, 0),
    totalKids: attending.reduce((sum, r) => sum + r.kids, 0),
    totalGuests: attending.reduce((sum, r) => sum + r.adults + r.kids, 0),
  };
}
