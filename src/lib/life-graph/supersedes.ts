import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { db } from './firestore-client';
import type { Fact } from './types';
import { randomUUID } from 'crypto';

export async function writeOrSupersedeFact(
  uid: string,
  newFact: Omit<Fact, 'id' | 'supersedes' | 'supersededBy'>
): Promise<string> {
  const factsCol = db.collection('users').doc(uid).collection('facts');

  return db.runTransaction(async (tx) => {
    const existing = await tx.get(
      factsCol
        .where('entityId', '==', newFact.entityId)
        .where('slot', '==', newFact.slot)
        .where('status', '==', 'current')
        .limit(1)
    );

    const newId = randomUUID();

    if (newFact.factType === 'stable') {
      if (!existing.empty) {
        const existingRef = existing.docs[0].ref;
        console.log(`[supersedes] stable fact in-place update entityId=${newFact.entityId} slot=${newFact.slot} existingId=${existing.docs[0].id}`);
        tx.update(existingRef, {
          value: newFact.value,
          lastVerified: Timestamp.now(),
          sourceMessageIds: FieldValue.arrayUnion(...newFact.sourceMessageIds),
          confidence: newFact.confidence,
        });
        return existing.docs[0].id;
      } else {
        console.log(`[supersedes] stable fact new insert entityId=${newFact.entityId} slot=${newFact.slot} newId=${newId}`);
        const ref = factsCol.doc(newId);
        tx.set(ref, {
          ...newFact,
          id: newId,
          status: 'current',
          supersedes: null,
          supersededBy: null,
        });
        return newId;
      }
    }

    if (newFact.factType === 'reminder') {
      if (!existing.empty) {
        console.log(`[supersedes] reminder append sourceMsg entityId=${newFact.entityId} slot=${newFact.slot} existingId=${existing.docs[0].id}`);
        const existingRef = existing.docs[0].ref;
        tx.update(existingRef, {
          lastVerified: Timestamp.now(),
          sourceMessageIds: FieldValue.arrayUnion(...newFact.sourceMessageIds),
        });
        return existing.docs[0].id;
      }
    }

    // time_sensitive (or reminder with no current)
    if (!existing.empty) {
      const existingDoc = existing.docs[0];
      const existingFact = existingDoc.data() as Fact;
      const existingTime = existingFact.effectiveTime.toMillis();
      const newTime = newFact.effectiveTime.toMillis();

      if (newTime > existingTime) {
        console.log(`[supersedes] superseding existingId=${existingDoc.id} with newId=${newId} entityId=${newFact.entityId} slot=${newFact.slot}`);
        tx.update(existingDoc.ref, { status: 'superseded', supersededBy: newId });
        tx.set(factsCol.doc(newId), {
          ...newFact,
          id: newId,
          status: 'current',
          supersedes: existingDoc.id,
          supersededBy: null,
        });
      } else {
        console.log(`[supersedes] out-of-order arrival, archiving newId=${newId} entityId=${newFact.entityId} slot=${newFact.slot}`);
        tx.set(factsCol.doc(newId), {
          ...newFact,
          id: newId,
          status: 'superseded',
          supersedes: null,
          supersededBy: existingDoc.id,
        });
      }
    } else {
      console.log(`[supersedes] new current fact newId=${newId} entityId=${newFact.entityId} slot=${newFact.slot} type=${newFact.factType}`);
      tx.set(factsCol.doc(newId), {
        ...newFact,
        id: newId,
        status: 'current',
        supersedes: null,
        supersededBy: null,
      });
    }

    return newId;
  });
}
