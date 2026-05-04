import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/src/lib/life-graph/get-user-id';
import { lookupSenderTier } from '@/src/lib/life-graph/ingest/dictionary-lookup';
import { evaluateIngestGate } from '@/src/lib/life-graph/ingest/content-gate';
import { deepIngest } from '@/src/lib/life-graph/ingest/deep-ingest';
import { retroactiveBoost } from '@/src/lib/life-graph/ingest/retroactive-boost';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    console.warn('[ingest/message] missing auth token');
    return NextResponse.json({ error: 'No auth token provided' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const accountId: string = body.accountId;
    if (!accountId) {
      console.warn('[ingest/message] missing accountId');
      return NextResponse.json({ error: 'Missing accountId in request body' }, { status: 400 });
    }

    const uid = await getUserId(token, accountId);
    console.log(`[ingest/message] uid=${uid} trigger=${body.trigger ?? 'normal'}`);

    // Retroactive boost path
    if (body.trigger === 'retroactive') {
      const { messageId, from, subject, deliveryTime, conversationId } = body;
      if (!messageId) {
        return NextResponse.json({ error: 'Missing messageId' }, { status: 400 });
      }
      console.log(`[ingest/message] retroactive boost messageId=${messageId}`);
      await retroactiveBoost(
        uid,
        token,
        messageId,
        from ?? { name: '', email: '' },
        subject ?? '',
        deliveryTime ? new Date(deliveryTime) : new Date(),
        conversationId ?? messageId
      );
      return NextResponse.json({ boosted: true });
    }

    // Normal ingest path
    const { messageId, conversationId, deliveryTime, from, subject, snippet, isRead, isStarred } = body;
    if (!messageId || !from || !subject) {
      console.warn(`[ingest/message] missing required fields`);
      return NextResponse.json(
        { error: 'Missing required fields: messageId, from, subject' },
        { status: 400 }
      );
    }

    console.log(`[ingest/message] messageId=${messageId} from=${from.email} subject="${subject.slice(0, 60)}"`);

    const { tier, entityId } = await lookupSenderTier(uid, token, from.email, from.name ?? '');
    console.log(`[ingest/message] tier=${tier} entityId=${entityId ?? 'none'}`);

    const { decision, reason } = evaluateIngestGate(tier, subject, snippet ?? '');
    console.log(`[ingest/message] gate decision=${decision} reason=${reason}`);

    if (decision === 'skip') {
      return NextResponse.json({ ingested: false, reason });
    }

    const path = tier === 'important' ? 'hot' : 'warm';
    const result = await deepIngest(uid, token, {
      id: messageId,
      conversationId: conversationId ?? messageId,
      deliveryTime: deliveryTime ? new Date(deliveryTime) : new Date(),
      from,
      subject,
      isRead: isRead ?? false,
      isStarred: isStarred ?? false,
    }, { path });

    console.log(`[ingest/message] done noteId=${result.noteId} relationshipsAdded=${result.relationshipsAdded}`);
    return NextResponse.json({ ingested: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[ingest/message] error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
