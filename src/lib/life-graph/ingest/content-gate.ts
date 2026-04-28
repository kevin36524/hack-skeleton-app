import type { SenderTier } from '../types';

const TRANSACTIONAL_PATTERNS =
  /confirmation|booking|reservation|receipt|shipped|delivered|ticket|itinerary|your trip|flight|payment|invoice/i;
const PROMOTIONAL_PATTERNS =
  /% off|\bsale\b|\bdeal\b|limited time|exclusive offer|last chance/i;

export function evaluateIngestGate(
  tier: SenderTier,
  subject: string,
  snippet: string
): { decision: 'deep_ingest' | 'skip'; reason: string } {
  if (tier === 'important') return { decision: 'deep_ingest', reason: 'tier_important' };
  if (tier === 'junk') return { decision: 'skip', reason: 'tier_junk' };

  // conditional
  const text = `${subject} ${snippet}`;
  if (TRANSACTIONAL_PATTERNS.test(text)) return { decision: 'deep_ingest', reason: 'transactional_keyword' };
  if (PROMOTIONAL_PATTERNS.test(text)) return { decision: 'skip', reason: 'promotional_blocklist' };
  return { decision: 'skip', reason: 'conditional_fallback' };
}
