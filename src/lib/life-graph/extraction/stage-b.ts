import { Timestamp } from 'firebase-admin/firestore';
import { mastra } from '@/src/mastra';
import { randomUUID } from 'crypto';
import {
  getNote,
  getEntity,
  upsertEntity,
  markNoteStageB,
  incrementIngestJobCost,
  findEntityByEmail,
  findEntityByLabel,
} from '../db';
import { writeOrSupersedeFact } from '../supersedes';
import { resolveEvent } from './identity-resolution';
import type { Entity, Note, NoteMessageRecord, Drawer, EntityType } from '../types';

interface StageBResult {
  factIds: string[];
  extractorPrompt?: string;
  extractorResponse?: string;
}

interface ExtractedEntity {
  label: string;
  email?: string;
  type?: string;
  relationshipClass?: string;
  sourceMessageIds?: string[];
}

interface ExtractedFact {
  entityLabel: string;
  slot: string;
  value: unknown;
  sourceMessageIds?: string[];
}

interface ExtractedRelationship {
  fromEntityLabel: string;
  slot: string;
  toEntityLabel: string;
  sourceMessageIds?: string[];
}

interface ExtractedEvent {
  label: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  participantEmails?: string[];
  isRecurring?: boolean;
  recurrenceRule?: string;
  seriesEndDate?: string;
  sourceMessageIds?: string[];
}

interface ExtractedCommitment {
  label: string;
  dueDate?: string;
  owedByUser?: boolean;
  owedToEntityLabel?: string;
  sourceMessageIds?: string[];
}

interface ExtractedOutput {
  entityUpdates?: ExtractedEntity[];
  newEntities?: ExtractedEntity[];
  facts?: ExtractedFact[];
  relationships?: ExtractedRelationship[];
  events?: ExtractedEvent[];
  commitments?: ExtractedCommitment[];
}

function drawerForType(t: EntityType): Drawer {
  if (t === 'event' || t === 'commitment') return 'commitments';
  if (t === 'life_thread') return 'life_threads';
  if (t === 'preference') return 'top_of_mind_prefs';
  return 'people_orgs';
}

function asEntityType(s: string | undefined, fallback: EntityType = 'person'): EntityType {
  switch (s) {
    case 'person':
    case 'organization':
    case 'household':
    case 'asset':
    case 'event':
    case 'commitment':
    case 'preference':
    case 'life_thread':
      return s;
    case 'org':
      return 'organization';
    default:
      return fallback;
  }
}

type RelClass = NonNullable<Entity['relationshipClass']>;
const REL_CLASSES = new Set<RelClass>([
  'family',
  'work',
  'school',
  'doctor',
  'vendor',
  'service',
  'newsletter',
  'unknown',
]);
function asRelClass(s: string | undefined): RelClass | undefined {
  if (!s) return undefined;
  return REL_CLASSES.has(s as RelClass) ? (s as RelClass) : undefined;
}

function buildRecordMap(notes: Note[]): Map<string, Timestamp> {
  const map = new Map<string, Timestamp>();
  for (const n of notes) {
    for (const r of n.messageRecords ?? []) {
      const existing = map.get(r.id);
      if (!existing || r.deliveryTime.toMillis() > existing.toMillis()) {
        map.set(r.id, r.deliveryTime);
      }
    }
    if (!n.messageRecords?.length) {
      map.set(n.sourceMessageId, n.deliveryTime);
    }
  }
  return map;
}

function effectiveTimeFromIds(
  ids: string[] | undefined,
  recordMap: Map<string, Timestamp>,
  fallback: Timestamp
): Timestamp {
  if (!ids || ids.length === 0) return fallback;
  let best: Timestamp | null = null;
  for (const id of ids) {
    const t = recordMap.get(id);
    if (t && (!best || t.toMillis() > best.toMillis())) best = t;
  }
  return best ?? fallback;
}

function nonEmptyIds(ids: string[] | undefined, fallback: string[]): string[] {
  return ids && ids.length > 0 ? ids : fallback;
}

interface ResolveSpec {
  label: string;
  email?: string;
  type?: EntityType;
  relationshipClass?: RelClass;
  sourceMessageIds: string[];
}

// Resolve an entity by email, then by label. Patch if found, otherwise create.
// Pass `stub=true` for entities created indirectly (relationship targets, commitment counterparties).
async function resolveOrCreateEntity(
  uid: string,
  spec: ResolveSpec,
  stub: boolean
): Promise<{ id: string; created: boolean }> {
  const now = Timestamp.now();

  let existing: Entity | null = null;
  if (spec.email) existing = await findEntityByEmail(uid, spec.email);
  if (!existing) existing = await findEntityByLabel(uid, spec.label);

  if (existing) {
    const patch: Partial<Entity> & { id: string } = { id: existing.id } as Entity;
    let dirty = false;
    if (spec.email && !existing.emailAddresses.includes(spec.email)) {
      patch.emailAddresses = [...existing.emailAddresses, spec.email];
      dirty = true;
    }
    if (spec.relationshipClass && !existing.relationshipClass) {
      patch.relationshipClass = spec.relationshipClass;
      dirty = true;
    }
    // Stash the LLM-supplied label as an alias if it differs from the canonical one.
    // Keeps Phase 1's roleLabel as `label` while letting consolidation match on either.
    if (spec.label && spec.label !== existing.label && !(existing.aliases ?? []).includes(spec.label)) {
      patch.aliases = [...(existing.aliases ?? []), spec.label];
      dirty = true;
    }
    const newSourceIds = spec.sourceMessageIds.filter((id) => !existing!.sourceMessageIds.includes(id));
    if (newSourceIds.length > 0) {
      patch.sourceMessageIds = [...existing.sourceMessageIds, ...newSourceIds];
      dirty = true;
    }
    if (existing.isStub && !stub) {
      patch.isStub = false;
      dirty = true;
    }
    if (dirty) {
      patch.lastUpdated = now;
      await upsertEntity(uid, patch as Entity);
      console.log(
        `[stage-b] patched entity id=${existing.id} label="${existing.label}" fields=[${Object.keys(patch).filter((k) => k !== 'id').join(',')}]`
      );
    }
    return { id: existing.id, created: false };
  }

  const type = spec.type ?? 'person';
  const id = randomUUID();
  const entity: Entity = {
    id,
    type,
    drawer: drawerForType(type),
    label: spec.label,
    aliases: [],
    emailAddresses: spec.email ? [spec.email] : [],
    sourceMessageIds: [...spec.sourceMessageIds],
    firstSeen: now,
    lastUpdated: now,
    pinned: false,
    pinnedAt: null,
    entryClock: null,
    decayClock: null,
    relationshipClass: spec.relationshipClass,
    ...(stub ? { isStub: true } : {}),
    payload: {},
    schemaVersion: 1,
  };
  await upsertEntity(uid, entity);
  console.log(`[stage-b] ${stub ? 'created stub' : 'created'} entity id=${id} label="${spec.label}" type=${type}`);
  return { id, created: true };
}

function isUserLabel(label: string, userEmail: string | undefined, userName: string | undefined): boolean {
  const lower = label.trim().toLowerCase();
  if (!lower) return false;
  if (lower === 'kevin' || lower === 'you' || lower === 'the user' || lower === 'mailbox owner') return true;
  if (userEmail && lower === userEmail.toLowerCase()) return true;
  if (userName && lower === userName.toLowerCase()) return true;
  return false;
}

interface StageBOptions {
  userEmail?: string;
  userName?: string;
}

export async function stageB(
  uid: string,
  primaryEntityId: string,
  noteIds: string[],
  jobId?: string,
  options: StageBOptions = {}
): Promise<StageBResult> {
  console.log(`[stage-b] start entityId=${primaryEntityId} noteIds=[${noteIds.join(',')}] jobId=${jobId ?? 'none'}`);

  const notes = (await Promise.all(noteIds.map((nid) => getNote(uid, nid)))).filter(
    (n): n is Note => n !== null && n.stageBStatus === 'pending'
  );
  console.log(`[stage-b] resolved ${notes.length}/${noteIds.length} pending notes`);

  if (notes.length === 0) {
    console.log(`[stage-b] no pending notes, returning early`);
    return { factIds: [] };
  }

  const primaryEntity = await getEntity(uid, primaryEntityId);
  if (!primaryEntity) {
    console.warn(`[stage-b] primary entity ${primaryEntityId} not found`);
    await Promise.all(notes.map((n) => markNoteStageB(uid, n.id, 'failed', [])));
    return { factIds: [], extractorPrompt: '', extractorResponse: '' };
  }

  const recordMap = buildRecordMap(notes);
  const allSourceIds = Array.from(recordMap.keys());

  const noteContent = notes
    .map((n) => {
      const date = n.deliveryTime.toDate().toISOString().slice(0, 10);
      return `[note ${n.sourceMessageId} | ${date} | from ${n.from.name} <${n.from.email}>]\n${n.notesText}`;
    })
    .join('\n\n');

  const ownerLine = options.userEmail ? `Mailbox owner: ${options.userEmail}\n` : '';
  const primaryLine = `Primary entity: ${primaryEntity.label}${primaryEntity.emailAddresses[0] ? ` <${primaryEntity.emailAddresses[0]}>` : ''}`;
  const extractorInput = `${ownerLine}${primaryLine}\n\nEmail analysis:\n${noteContent}`;

  console.log(`[stage-b] calling lifeGraphExtractorAgent for entityId=${primaryEntityId} with ${notes.length} notes`);
  const extractorAgent = mastra.getAgent('lifeGraphExtractorAgent');
  const response = await extractorAgent.generate(extractorInput);
  const raw = response.text ?? '';
  console.log(`[stage-b] LLM response length=${raw.length}`);

  let extracted: ExtractedOutput = {};
  try {
    extracted = JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim());
    console.log(
      `[stage-b] parsed: entityUpdates=${extracted.entityUpdates?.length ?? 0} newEntities=${extracted.newEntities?.length ?? 0} facts=${extracted.facts?.length ?? 0} relationships=${extracted.relationships?.length ?? 0} events=${extracted.events?.length ?? 0} commitments=${extracted.commitments?.length ?? 0}`
    );
  } catch (err) {
    console.warn(`[stage-b] JSON parse failed for entityId=${primaryEntityId}: ${err}`);
    await Promise.all(notes.map((n) => markNoteStageB(uid, n.id, 'failed', [])));
    return { factIds: [], extractorPrompt: extractorInput, extractorResponse: raw };
  }

  const now = Timestamp.now();
  const factIds: string[] = [];

  // ── 1. Resolve / create entities. Build a label → id map for downstream ops. ─
  const labelToId = new Map<string, string>();
  labelToId.set(primaryEntity.label.toLowerCase(), primaryEntityId);
  for (const alias of primaryEntity.aliases ?? []) {
    labelToId.set(alias.toLowerCase(), primaryEntityId);
  }
  for (const email of primaryEntity.emailAddresses ?? []) {
    labelToId.set(email.toLowerCase(), primaryEntityId);
  }

  const entitySpecs: ExtractedEntity[] = [...(extracted.entityUpdates ?? []), ...(extracted.newEntities ?? [])];
  for (const ent of entitySpecs) {
    if (!ent.label) continue;
    const sourceIds = nonEmptyIds(ent.sourceMessageIds, allSourceIds);
    const { id } = await resolveOrCreateEntity(
      uid,
      {
        label: ent.label,
        email: ent.email,
        type: asEntityType(ent.type),
        relationshipClass: asRelClass(ent.relationshipClass),
        sourceMessageIds: sourceIds,
      },
      false
    );
    labelToId.set(ent.label.toLowerCase(), id);
    if (ent.email) labelToId.set(ent.email.toLowerCase(), id);
  }

  async function resolveLabelOrStub(
    label: string,
    sourceIds: string[],
    typeHint: EntityType = 'person'
  ): Promise<string> {
    const cached = labelToId.get(label.toLowerCase());
    if (cached) return cached;
    const { id } = await resolveOrCreateEntity(
      uid,
      { label, type: typeHint, sourceMessageIds: sourceIds },
      true
    );
    labelToId.set(label.toLowerCase(), id);
    return id;
  }

  // ── 2. Facts ───────────────────────────────────────────────────────────────
  for (const f of extracted.facts ?? []) {
    if (!f.entityLabel || !f.slot) continue;
    try {
      const sourceIds = nonEmptyIds(f.sourceMessageIds, allSourceIds);
      const entityId = await resolveLabelOrStub(f.entityLabel, sourceIds);
      const target = await getEntity(uid, entityId);
      const drawer: Drawer = target ? target.drawer : 'people_orgs';
      const eff = effectiveTimeFromIds(f.sourceMessageIds, recordMap, now);
      console.log(`[stage-b] fact slot=${f.slot} entityId=${entityId} eff=${eff.toDate().toISOString().slice(0, 10)}`);
      const fid = await writeOrSupersedeFact(uid, {
        entityId,
        slot: f.slot,
        factType: 'stable',
        value: f.value,
        status: 'current',
        authority: 'email_derived',
        confidence: 0.8,
        sourceMessageIds: sourceIds,
        firstSeen: now,
        lastVerified: now,
        effectiveTime: eff,
        drawer,
      });
      factIds.push(fid);
    } catch (err) {
      console.warn(`[stage-b] failed to write fact slot=${f.slot} for "${f.entityLabel}": ${err}`);
    }
  }

  // ── 3. Relationships ───────────────────────────────────────────────────────
  for (const r of extracted.relationships ?? []) {
    if (!r.fromEntityLabel || !r.toEntityLabel || !r.slot) continue;
    try {
      const sourceIds = nonEmptyIds(r.sourceMessageIds, allSourceIds);
      const fromId = await resolveLabelOrStub(r.fromEntityLabel, sourceIds);
      const toId = await resolveLabelOrStub(r.toEntityLabel, sourceIds);
      const fromEnt = await getEntity(uid, fromId);
      const drawer: Drawer = fromEnt ? fromEnt.drawer : 'people_orgs';
      const eff = effectiveTimeFromIds(r.sourceMessageIds, recordMap, now);
      console.log(`[stage-b] relationship ${r.fromEntityLabel} --${r.slot}--> ${r.toEntityLabel}`);
      const fid = await writeOrSupersedeFact(uid, {
        entityId: fromId,
        slot: r.slot,
        factType: 'relationship',
        value: toId,
        status: 'current',
        authority: 'email_derived',
        confidence: 0.85,
        sourceMessageIds: sourceIds,
        firstSeen: now,
        lastVerified: now,
        effectiveTime: eff,
        drawer,
      });
      factIds.push(fid);
    } catch (err) {
      console.warn(`[stage-b] failed to write relationship ${r.fromEntityLabel}--${r.slot}-->${r.toEntityLabel}: ${err}`);
    }
  }

  // ── 4. Events ──────────────────────────────────────────────────────────────
  for (const e of extracted.events ?? []) {
    if (!e.label) continue;
    try {
      const sourceIds = nonEmptyIds(e.sourceMessageIds, allSourceIds);
      const startDate = e.startTime ? new Date(e.startTime) : null;
      const endDate = e.endTime ? new Date(e.endTime) : null;
      const participantEmails = (e.participantEmails ?? []).filter(Boolean);

      let eid: string | null = startDate ? await resolveEvent(uid, e.label, startDate, participantEmails) : null;
      if (eid) {
        console.log(`[stage-b] resolved existing event eid=${eid} label="${e.label}"`);
        continue; // existing event — don't overwrite for now
      }

      eid = randomUUID();
      const resolvedParticipantIds: string[] = [];
      const unresolvedEmails: string[] = [];
      for (const email of participantEmails) {
        const hit = await findEntityByEmail(uid, email);
        if (hit) resolvedParticipantIds.push(hit.id);
        else unresolvedEmails.push(email);
      }

      const isRecurring = !!e.isRecurring;
      const startTs = startDate ? Timestamp.fromDate(startDate) : undefined;
      const endTs = endDate ? Timestamp.fromDate(endDate) : undefined;
      const seriesEndTs = e.seriesEndDate ? Timestamp.fromDate(new Date(e.seriesEndDate)) : undefined;

      const entity: Entity = {
        id: eid,
        type: 'event',
        drawer: 'commitments',
        label: e.label,
        aliases: [],
        emailAddresses: [],
        sourceMessageIds: sourceIds,
        firstSeen: now,
        lastUpdated: now,
        pinned: false,
        pinnedAt: null,
        entryClock: null,
        decayClock: null,
        startTime: startTs,
        endTime: endTs,
        location: e.location,
        participantIds: resolvedParticipantIds,
        participantEmails: unresolvedEmails.length > 0 ? unresolvedEmails : undefined,
        isRecurring: isRecurring || undefined,
        recurrenceRule: isRecurring ? e.recurrenceRule : undefined,
        nextOccurrence: isRecurring ? startTs : undefined,
        seriesEndDate: isRecurring ? seriesEndTs : undefined,
        lifeThreadStatus: isRecurring ? 'active' : undefined,
        payload: {},
        schemaVersion: 1,
      };
      await upsertEntity(uid, entity);
      console.log(
        `[stage-b] created event eid=${eid} label="${e.label}" start=${startTs ? startTs.toDate().toISOString() : 'none'} recurring=${isRecurring} location=${e.location ?? ''}`
      );
    } catch (err) {
      console.warn(`[stage-b] failed to write event "${e.label}": ${err}`);
    }
  }

  // ── 5. Commitments ────────────────────────────────────────────────────────
  for (const c of extracted.commitments ?? []) {
    if (!c.label) continue;
    try {
      const sourceIds = nonEmptyIds(c.sourceMessageIds, allSourceIds);
      const eid = randomUUID();

      let counterpartyId: string | undefined;
      if (c.owedToEntityLabel) {
        if (isUserLabel(c.owedToEntityLabel, options.userEmail, options.userName)) {
          counterpartyId = uid;
        } else {
          counterpartyId = await resolveLabelOrStub(c.owedToEntityLabel, sourceIds);
        }
      }

      const owedBy = c.owedByUser ? uid : counterpartyId;
      const owedTo = c.owedByUser ? counterpartyId : uid;

      const entity: Entity = {
        id: eid,
        type: 'commitment',
        drawer: 'commitments',
        label: c.label,
        aliases: [],
        emailAddresses: [],
        sourceMessageIds: sourceIds,
        firstSeen: now,
        lastUpdated: now,
        pinned: false,
        pinnedAt: null,
        entryClock: null,
        decayClock: null,
        dueDate: c.dueDate ? Timestamp.fromDate(new Date(c.dueDate)) : undefined,
        resolvedAt: null,
        owedBy,
        owedTo,
        payload: {},
        schemaVersion: 1,
      };
      await upsertEntity(uid, entity);
      console.log(
        `[stage-b] created commitment eid=${eid} label="${c.label}" due=${c.dueDate ?? 'none'} owedBy=${owedBy ?? 'none'} owedTo=${owedTo ?? 'none'}`
      );
    } catch (err) {
      console.warn(`[stage-b] failed to write commitment "${c.label}": ${err}`);
    }
  }

  await Promise.all(notes.map((n) => markNoteStageB(uid, n.id, 'processed', factIds)));
  console.log(`[stage-b] marked ${notes.length} notes processed, produced ${factIds.length} factIds`);

  if (jobId) {
    await incrementIngestJobCost(uid, jobId, 0.003);
    console.log(`[stage-b] incremented job cost $0.003 jobId=${jobId}`);
  }

  return { factIds, extractorPrompt: extractorInput, extractorResponse: raw };
}

// re-export for tests / consolidation tooling
export type { NoteMessageRecord };
