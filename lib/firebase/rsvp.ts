import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "./config";
import type { RSVP, RSVPInput, RSVPStats } from "@/lib/types";

const COLLECTION = "rsvps";

function docToRSVP(id: string, data: Record<string, unknown>): RSVP {
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

export async function createRSVP(input: RSVPInput): Promise<RSVP> {
  const db = getFirebaseDb();
  const now = serverTimestamp();
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: now,
    updatedAt: now,
  });
  return {
    id: docRef.id,
    ...input,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function updateRSVP(
  id: string,
  input: Partial<RSVPInput>
): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function getRSVPByEmail(email: string): Promise<RSVP | null> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, COLLECTION),
    where("email", "==", email)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return docToRSVP(doc.id, doc.data());
}

export async function getAllRSVPs(): Promise<RSVP[]> {
  const db = getFirebaseDb();
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
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
