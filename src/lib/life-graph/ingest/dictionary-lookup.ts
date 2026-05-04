import { Timestamp } from 'firebase-admin/firestore';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { randomUUID } from 'crypto';
import { yahooGet } from '@/src/mastra/helpers/yahoo-api';
import { getMailboxId } from '@/src/mastra/helpers/get-mailbox-id';
import { findEntityByEmail, upsertEntity } from '../db';
import type { Entity, SenderTier } from '../types';
import type { SearchMessagesApiResponse } from '@/lib/types/api';

interface LookupResult {
  tier: SenderTier;
  entityId: string | null;
  confidence: number;
}

export async function lookupSenderTier(
  uid: string,
  token: string,
  senderEmail: string,
  senderName: string
): Promise<LookupResult> {
  console.log(`[dict-lookup] uid=${uid} email=${senderEmail}`);

  const entity = await findEntityByEmail(uid, senderEmail);
  if (entity?.senderClass && (entity.senderClassConfidence ?? 0) >= 0.5) {
    console.log(`[dict-lookup] cache hit entityId=${entity.id} tier=${entity.senderClass} confidence=${entity.senderClassConfidence}`);
    return {
      tier: entity.senderClass,
      entityId: entity.id,
      confidence: entity.senderClassConfidence ?? 0,
    };
  }
  if (entity) {
    console.log(`[dict-lookup] entity found but senderClass missing/low-confidence, re-profiling`);
  } else {
    console.log(`[dict-lookup] no entity found for ${senderEmail}, running on-the-fly profiling`);
  }

  try {
    const mailboxId = await getMailboxId(token);
    const searchQuery = `from:${senderEmail}+offset:0+count:5`;
    const resp = await yahooGet<SearchMessagesApiResponse>(
      token,
      `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${searchQuery}`
    );
    console.log(`[dict-lookup] fetched ${resp.messages?.length ?? 0} messages for ${senderEmail}`);

    const subjectLines = (resp.messages ?? [])
      .slice(0, 5)
      .map((m) => `- ${m.headers?.subject ?? '(no subject)'}: ${m.snippet?.slice(0, 100) ?? ''}`)
      .join('\n');

    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      system: `You are classifying an email sender for a personal assistant. Return JSON with:
- entityType: "person" | "organization"
- relationshipClass: "family" | "work" | "school" | "doctor" | "vendor" | "service" | "newsletter" | "unknown"
- roleLabel: short human label
- senderTier: "important" | "conditional" | "junk"
- confidence: 0.0 to 1.0
Only valid JSON, no markdown.`,
      prompt: `Sender: ${senderName} <${senderEmail}>\n\nRecent emails:\n${subjectLines}`,
    });

    const profile = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    const confidence: number = profile.confidence ?? 0;
    const tier: SenderTier = confidence >= 0.5 ? (profile.senderTier as SenderTier) : 'conditional';
    console.log(`[dict-lookup] on-the-fly profile for ${senderEmail}: tier=${tier} confidence=${confidence}`);

    const now = Timestamp.now();
    const eid = entity?.id ?? randomUUID();

    if (!entity) {
      const newEntity: Entity = {
        id: eid,
        type: profile.entityType ?? 'person',
        drawer: 'people_orgs',
        label: profile.roleLabel ?? senderName,
        aliases: [senderName].filter(Boolean),
        emailAddresses: [senderEmail],
        sourceMessageIds: [],
        firstSeen: now,
        lastUpdated: now,
        pinned: false,
        pinnedAt: null,
        entryClock: null,
        decayClock: null,
        relationshipClass: profile.relationshipClass,
        senderClass: tier,
        senderClassConfidence: confidence,
        payload: {},
        schemaVersion: 1,
      };
      await upsertEntity(uid, newEntity);
      console.log(`[dict-lookup] created new entity eid=${eid} for ${senderEmail}`);
    } else {
      await upsertEntity(uid, {
        id: eid,
        senderClass: tier,
        senderClassConfidence: confidence,
        lastUpdated: now,
      } as Entity);
    }

    return { tier, entityId: eid, confidence };
  } catch (err) {
    console.warn(`[dict-lookup] on-the-fly profiling failed for ${senderEmail}: ${err} — defaulting to conditional`);
    return { tier: 'conditional', entityId: entity?.id ?? null, confidence: 0 };
  }
}
