import { db } from '../firestore-client';
import { findEntityByEmail } from '../db';
import type { Entity } from '../types';

export async function resolvePersonOrOrg(
  uid: string,
  email: string,
  label: string
): Promise<string | null> {
  if (!email || !email.includes('@')) return null;
  const entity = await findEntityByEmail(uid, email);
  return entity ? entity.id : null;
}

// Resolve an event by startTime window (±30 min) and participant overlap ≥ 1
export async function resolveEvent(
  uid: string,
  label: string,
  startTime: Date,
  participantEmails: string[]
): Promise<string | null> {
  const windowMs = 30 * 60 * 1000;
  const low = new Date(startTime.getTime() - windowMs);
  const high = new Date(startTime.getTime() + windowMs);

  const { Timestamp } = await import('firebase-admin/firestore');

  const snap = await db
    .collection('users')
    .doc(uid)
    .collection('entities')
    .where('type', '==', 'event')
    .where('startTime', '>=', Timestamp.fromDate(low))
    .where('startTime', '<=', Timestamp.fromDate(high))
    .get();

  if (snap.empty) return null;

  // Find participant IDs for the given emails
  const participantEntityIds = await Promise.all(
    participantEmails.map((email) => findEntityByEmail(uid, email).then((e) => e?.id ?? null))
  );
  const participantSet = new Set(participantEntityIds.filter(Boolean));

  for (const doc of snap.docs) {
    const entity = doc.data() as Entity;
    const entityParticipants = entity.participantIds ?? [];
    const overlap = entityParticipants.some((id) => participantSet.has(id));
    if (overlap) return entity.id;
  }

  return null;
}
