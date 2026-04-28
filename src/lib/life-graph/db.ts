import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { db } from './firestore-client';
import type { Profile, Entity, Fact, Note, IngestJob, JobCall, Drawer } from './types';

// --- Path helpers ---
function profileDoc(uid: string) {
  return db.collection('users').doc(uid).collection('profile').doc('main');
}
function entityDoc(uid: string, eid: string) {
  return db.collection('users').doc(uid).collection('entities').doc(eid);
}
function factDoc(uid: string, fid: string) {
  return db.collection('users').doc(uid).collection('facts').doc(fid);
}
function noteDoc(uid: string, nid: string) {
  return db.collection('users').doc(uid).collection('notes').doc(nid);
}
function ingestJobDoc(uid: string, jid: string) {
  return db.collection('users').doc(uid).collection('ingestJobs').doc(jid);
}

// --- Profile ---
export async function getProfile(uid: string): Promise<Profile | null> {
  const snap = await profileDoc(uid).get();
  return snap.exists ? (snap.data() as Profile) : null;
}

export async function setProfile(uid: string, profile: Profile): Promise<void> {
  await profileDoc(uid).set(profile);
}

export async function updateProfileBackfillStatus(
  uid: string,
  update: Partial<Profile['backfillStatus']>
): Promise<void> {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(update)) {
    fields[`backfillStatus.${k}`] = v;
  }
  await profileDoc(uid).update(fields);
}

// --- Entities ---
export async function getEntity(uid: string, eid: string): Promise<Entity | null> {
  const snap = await entityDoc(uid, eid).get();
  return snap.exists ? (snap.data() as Entity) : null;
}

export async function upsertEntity(uid: string, entity: Entity): Promise<void> {
  await entityDoc(uid, entity.id).set({ ...entity, lastUpdated: Timestamp.now() }, { merge: true });
}

export async function findEntityByEmail(uid: string, email: string): Promise<Entity | null> {
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection('entities')
    .where('emailAddresses', 'array-contains', email)
    .limit(1)
    .get();
  return snap.empty ? null : (snap.docs[0].data() as Entity);
}

export async function listEntitiesByDrawer(uid: string, drawer: Drawer): Promise<Entity[]> {
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection('entities')
    .where('drawer', '==', drawer)
    .get();
  return snap.docs.map((d) => d.data() as Entity);
}

// --- Facts ---
export async function getFact(uid: string, fid: string): Promise<Fact | null> {
  const snap = await factDoc(uid, fid).get();
  return snap.exists ? (snap.data() as Fact) : null;
}

export async function getCurrentFact(
  uid: string,
  entityId: string,
  slot: string
): Promise<Fact | null> {
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection('facts')
    .where('entityId', '==', entityId)
    .where('slot', '==', slot)
    .where('status', '==', 'current')
    .limit(1)
    .get();
  return snap.empty ? null : (snap.docs[0].data() as Fact);
}

export async function insertFact(uid: string, fact: Fact): Promise<void> {
  await factDoc(uid, fact.id).set(fact);
}

export async function appendSourceMessageId(
  uid: string,
  fid: string,
  messageId: string
): Promise<void> {
  await factDoc(uid, fid).update({
    sourceMessageIds: FieldValue.arrayUnion(messageId),
    lastVerified: Timestamp.now(),
  });
}

// --- Notes ---
export async function getNote(uid: string, nid: string): Promise<Note | null> {
  const snap = await noteDoc(uid, nid).get();
  return snap.exists ? (snap.data() as Note) : null;
}

export async function insertNote(uid: string, note: Note): Promise<void> {
  await noteDoc(uid, note.id).set(note);
}

export async function markNoteStageB(
  uid: string,
  nid: string,
  status: Note['stageBStatus'],
  producedFactIds: string[]
): Promise<void> {
  await noteDoc(uid, nid).update({
    stageBStatus: status,
    stageBProcessedAt: Timestamp.now(),
    producedFactIds: FieldValue.arrayUnion(...producedFactIds),
  });
}

export async function listPendingStageBNotes(uid: string, limit: number): Promise<Note[]> {
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection('notes')
    .where('stageBStatus', '==', 'pending')
    .orderBy('deliveryTime', 'asc')
    .limit(limit)
    .get();
  return snap.docs.map((d) => d.data() as Note);
}

// --- IngestJobs ---
export async function createIngestJob(uid: string, job: IngestJob): Promise<void> {
  await ingestJobDoc(uid, job.id).set(job);
}

export async function updateIngestJob(
  uid: string,
  jid: string,
  update: Partial<IngestJob>
): Promise<void> {
  await ingestJobDoc(uid, jid).update(update as Record<string, unknown>);
}

export async function getIngestJob(uid: string, jid: string): Promise<IngestJob | null> {
  const snap = await ingestJobDoc(uid, jid).get();
  return snap.exists ? (snap.data() as IngestJob) : null;
}

// --- WU-06: IngestJob cost / progress helpers ---
export async function incrementIngestJobCost(
  uid: string,
  jid: string,
  dollarDelta: number
): Promise<void> {
  await ingestJobDoc(uid, jid).update({
    costSpent: FieldValue.increment(dollarDelta),
  });
}

export async function appendProcessedMessageId(
  uid: string,
  jid: string,
  messageId: string
): Promise<void> {
  await ingestJobDoc(uid, jid).update({
    processedMessageIds: FieldValue.arrayUnion(messageId),
  });
}

export async function appendJobCalls(uid: string, jid: string, calls: JobCall[]): Promise<void> {
  if (calls.length === 0) return;
  await ingestJobDoc(uid, jid).update({
    calls: FieldValue.arrayUnion(...(calls as unknown[])),
    callCount: FieldValue.increment(calls.length),
  });
}

export async function checkCostCap(uid: string, jid: string): Promise<boolean> {
  const job = await getIngestJob(uid, jid);
  if (!job) return false;
  if (job.costSpent >= job.costBudget) {
    await ingestJobDoc(uid, jid).update({ status: 'capped' });
    return true;
  }
  return false;
}

export async function listEntities(uid: string): Promise<Entity[]> {
  const snap = await db.collection('users').doc(uid).collection('entities').get();
  return snap.docs.map((d) => d.data() as Entity);
}

export async function deleteEntity(uid: string, eid: string): Promise<void> {
  await entityDoc(uid, eid).delete();
}

export async function deleteUserGraph(uid: string): Promise<void> {
  const userRef = db.collection('users').doc(uid);
  const subcollections = ['profile', 'entities', 'facts', 'notes', 'ingestJobs'];
  for (const sub of subcollections) {
    const snap = await userRef.collection(sub).get();
    if (snap.empty) continue;
    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    console.log(`[db] deleted ${snap.size} docs from users/${uid}/${sub}`);
  }
}
