import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../firestore-client';
import { listEntities, upsertEntity, deleteEntity } from '../db';
import type { Entity } from '../types';

export interface ConsolidationSummary {
  stubsMerged: number;
  duplicatesMerged: number;
  participantsResolved: number;
}

function normLabel(s: string | undefined | null): string {
  return (s ?? '').trim().toLowerCase();
}

// Programmatic consolidation pass run after Phase 2.
// 1. Merge stub entities into fully profiled entities that match by email or label.
// 2. Resolve `participantEmails` on events to entity IDs now that more entities exist.
// 3. Dedupe duplicate entities (same email or same label+type) created independently.
//
// No LLM calls. Safe to re-run.
export async function consolidateGraph(uid: string): Promise<ConsolidationSummary> {
  const summary: ConsolidationSummary = {
    stubsMerged: 0,
    duplicatesMerged: 0,
    participantsResolved: 0,
  };

  const all = await listEntities(uid);

  // ── 1 + 3. Build canonical buckets keyed by email and (type, label). ───────
  // Within each bucket, we keep one "winner" and remap all other ids to it.
  const remap = new Map<string, string>(); // looserId → canonicalId

  function canonical(id: string): string {
    let cur = id;
    for (let i = 0; i < 8; i++) {
      const next = remap.get(cur);
      if (!next || next === cur) return cur;
      cur = next;
    }
    return cur;
  }

  // Score: prefer non-stub, more sourceMessageIds, more emails, older firstSeen.
  function score(e: Entity): number {
    return (
      (e.isStub ? 0 : 1000) +
      (e.emailAddresses?.length ?? 0) * 10 +
      (e.sourceMessageIds?.length ?? 0)
    );
  }

  function pickWinner(a: Entity, b: Entity): { winner: Entity; loser: Entity } {
    return score(a) >= score(b) ? { winner: a, loser: b } : { winner: b, loser: a };
  }

  function mergeInto(winner: Entity, loser: Entity): Entity {
    const aliases = new Set<string>([...(winner.aliases ?? []), ...(loser.aliases ?? [])]);
    if (loser.label && loser.label !== winner.label) aliases.add(loser.label);
    const emailAddresses = Array.from(new Set([...(winner.emailAddresses ?? []), ...(loser.emailAddresses ?? [])]));
    const sourceMessageIds = Array.from(
      new Set([...(winner.sourceMessageIds ?? []), ...(loser.sourceMessageIds ?? [])])
    );
    const bothStub = !!(winner.isStub && loser.isStub);
    const { isStub: _winnerIsStub, ...winnerRest } = winner;
    return {
      ...winnerRest,
      aliases: Array.from(aliases),
      emailAddresses,
      sourceMessageIds,
      relationshipClass: winner.relationshipClass ?? loser.relationshipClass,
      ...(bothStub ? { isStub: true as const } : {}),
      lastUpdated: Timestamp.now(),
    };
  }

  const byEmail = new Map<string, Entity>();
  const byLabel = new Map<string, Entity>();
  const merged = new Map<string, Entity>(); // canonicalId → entity (with merged data)

  for (const e of all) {
    let target: Entity = merged.get(e.id) ?? e;

    for (const email of target.emailAddresses ?? []) {
      const key = email.toLowerCase();
      const incumbent = byEmail.get(key);
      if (incumbent && incumbent.id !== target.id) {
        const { winner, loser } = pickWinner(incumbent, target);
        const combined = mergeInto(winner, loser);
        merged.set(winner.id, combined);
        merged.delete(loser.id);
        remap.set(loser.id, winner.id);
        if (loser.isStub) summary.stubsMerged++;
        else summary.duplicatesMerged++;
        target = combined;
      } else {
        byEmail.set(key, target);
      }
    }

    if (target.type === 'person' || target.type === 'organization' || target.type === 'household' || target.type === 'asset') {
      const key = `${target.type}::${normLabel(target.label)}`;
      if (key.endsWith('::')) {
        // empty label — skip
      } else {
        const incumbent = byLabel.get(key);
        if (incumbent && incumbent.id !== target.id) {
          const { winner, loser } = pickWinner(incumbent, target);
          const combined = mergeInto(winner, loser);
          merged.set(winner.id, combined);
          merged.delete(loser.id);
          remap.set(loser.id, winner.id);
          if (loser.isStub) summary.stubsMerged++;
          else summary.duplicatesMerged++;
          target = combined;
          for (const email of combined.emailAddresses ?? []) byEmail.set(email.toLowerCase(), combined);
        } else {
          byLabel.set(key, target);
        }
      }
    }

    if (!merged.has(target.id) && target === e) merged.set(target.id, target);
  }

  // ── 2. Resolve participantEmails on events to entity IDs ──────────────────
  // Build email → canonical-id map
  const emailToId = new Map<string, string>();
  for (const [email, ent] of byEmail.entries()) {
    emailToId.set(email, canonical(ent.id));
  }

  for (const e of all) {
    const cid = canonical(e.id);
    if (cid !== e.id) continue; // skip losers — they'll be deleted
    const live = merged.get(cid) ?? e;
    if (live.type !== 'event') continue;
    const unresolved = live.participantEmails ?? [];
    if (unresolved.length === 0) continue;

    const stillUnresolved: string[] = [];
    const resolved = new Set<string>(live.participantIds ?? []);
    for (const email of unresolved) {
      const id = emailToId.get(email.toLowerCase());
      if (id) {
        resolved.add(id);
        summary.participantsResolved++;
      } else {
        stillUnresolved.push(email);
      }
    }

    if (resolved.size !== (live.participantIds ?? []).length || stillUnresolved.length !== unresolved.length) {
      const updated: Entity = {
        ...live,
        participantIds: Array.from(resolved),
        participantEmails: stillUnresolved.length > 0 ? stillUnresolved : undefined,
        lastUpdated: Timestamp.now(),
      };
      merged.set(cid, updated);
    }
  }

  // ── Persist merges ────────────────────────────────────────────────────────
  // Write winners, delete losers, and rewrite fact pointers (relationship targets,
  // commitment owedBy/owedTo) that point at remapped ids.
  for (const [id, ent] of merged.entries()) {
    if (canonical(id) !== id) continue;
    await upsertEntity(uid, ent);
  }
  for (const loserId of remap.keys()) {
    if (canonical(loserId) === loserId) continue;
    await deleteEntity(uid, loserId).catch((err) =>
      console.warn(`[consolidation] failed to delete loser ${loserId}: ${err}`)
    );
  }

  if (remap.size > 0) {
    const winners = new Set(Array.from(merged.keys()).map(canonical));

    // Update commitment owedBy/owedTo and inline relationships[].toEntityId on
    // every entity. Both can point at remapped ids after merges.
    const entitiesSnap = await db.collection('users').doc(uid).collection('entities').get();
    const eBatch = db.batch();
    let relWrites = 0;
    let commitWrites = 0;
    for (const doc of entitiesSnap.docs) {
      const data = doc.data() as Entity;
      const updates: Record<string, unknown> = {};

      if (data.type === 'commitment') {
        if (data.owedBy && remap.has(data.owedBy)) {
          const c = canonical(data.owedBy);
          if (winners.has(c)) updates.owedBy = c;
        }
        if (data.owedTo && remap.has(data.owedTo)) {
          const c = canonical(data.owedTo);
          if (winners.has(c)) updates.owedTo = c;
        }
      }

      if (data.relationships && data.relationships.length > 0) {
        let dirty = false;
        const seen = new Set<string>();
        const rewritten: Entity['relationships'] = [];
        for (const r of data.relationships) {
          let toId = r.toEntityId;
          if (toId && remap.has(toId)) {
            const c = canonical(toId);
            if (winners.has(c)) {
              toId = c;
              dirty = true;
            }
          }
          const dedupKey = `${r.slot}::${toId}`;
          if (seen.has(dedupKey)) {
            dirty = true;
            continue;
          }
          seen.add(dedupKey);
          rewritten.push({ ...r, toEntityId: toId });
        }
        if (dirty) updates.relationships = rewritten;
      }

      if (Object.keys(updates).length > 0) {
        eBatch.update(doc.ref, updates);
        if ('relationships' in updates) relWrites++;
        if ('owedBy' in updates || 'owedTo' in updates) commitWrites++;
      }
    }
    if (relWrites > 0 || commitWrites > 0) await eBatch.commit();
    console.log(`[consolidation] rewrote ${relWrites} relationships, ${commitWrites} commitment counterparties`);
  }

  return summary;
}
