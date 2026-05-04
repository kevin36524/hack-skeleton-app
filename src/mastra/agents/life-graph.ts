import { Agent } from '@mastra/core/agent';

export const lifeGraphClassifierAgent = new Agent({
  id: 'life-graph-classifier-agent',
  name: 'Life Graph Classifier Agent',
  model: 'google/gemini-3.1-flash-lite-preview',
  instructions: `You are classifying an email sender for a personal assistant. Given a sample of recent emails from one sender, return a JSON object with these exact fields:
- entityType: "person" | "organization"
- relationshipClass: "family" | "work" | "school" | "doctor" | "vendor" | "service" | "newsletter" | "unknown"
- roleLabel: short human label, e.g. "Boss at Stripe", "Kid's school", "Amazon orders"
- senderTier: "important" | "conditional" | "junk"
- confidence: 0.0 to 1.0

Respond with only valid JSON, no markdown fences.`,
});

export const lifeGraphNoteAgent = new Agent({
  id: 'life-graph-note-agent',
  name: 'Life Graph Note Agent',
  model: 'google/gemini-3.1-flash-lite-preview',
  instructions: `You are a research analyst reviewing email(s) for a personal assistant's knowledge graph. Each email in the input is labelled with a message id like "[msg id: msg_xxx]" and an ISO date.

Write a concise free-form summary covering:
1. Who the sender is — name, role, organization, relationship to the mailbox owner
2. Stable facts — job title, company, relationship type, preferences, contact details
3. Other people, organizations, properties or assets referenced — kids, spouse, school, doctor, realtor, address, etc.
4. Meetings or events — topic, specific date/time, location, participants, whether it is recurring (and the recurrence pattern)
5. Commitments / action items — what is owed, by whom, to whom, by when
6. Active topics, threads, or ongoing situations

Rules:
- Be specific with dates, times, locations.
- Resolve relative references ("next Thursday", "tomorrow") against the email date shown in brackets.
- If multiple emails contradict each other (e.g. a rescheduled meeting), note the most recent value and flag the change.
- **Annotate every claim with the message id(s) it came from in square brackets.** Example:
    "Niti Patel is the mailbox owner's spouse [msg_123]. She works at Twilio (nitpatel@twilio.com) [msg_124, msg_125]."
    "Anvay's 5th birthday is on May 3 at the Hiller Aviation Museum, San Carlos [msg_126]."
    "Hriyaan has weekly soccer at the Irvington Community Center, Saturdays 8-9am, April 18 – May 17 2026 [msg_127]."
- Use the literal message id strings as they appear in the input — do not invent ids.
- Write in plain prose or bullets. **Do not output JSON.** A downstream structured extractor consumes your prose.`,
});

export const lifeGraphTopOfMindAgent = new Agent({
  id: 'life-graph-top-of-mind-agent',
  name: 'Life Graph Top Of Mind Agent',
  model: 'google/gemini-3.1-flash-lite-preview',
  instructions: `You are a structured-data extractor for a personal assistant's Life Graph.
Given a batch of email notes, focus ONLY on commitments (deadlines, action items, meetings) due within the next 30 days.

Return a JSON object with:
{
  "commitments": [
    {
      "label": "Send Q2 report to Sarah",
      "dueDate": "2026-05-01",
      "owedByUser": true,
      "owedToEntityLabel": "Sarah Chen"
    }
  ],
  "events": [
    {
      "label": "Starbucks meeting with Sarah",
      "startTime": "2026-04-30T10:00:00",
      "participantEmails": ["sarah@stripe.com"]
    }
  ]
}

Rules:
- All datetimes must be ISO 8601 strings. Resolve relative references against each note's deliveryTime.
- Only include items due within 30 days. Omit anything further out or uncertain.
- Return only valid JSON, no markdown.`,
});

export const lifeGraphExtractorAgent = new Agent({
  id: 'life-graph-extractor-agent',
  name: 'Life Graph Extractor Agent',
  model: 'google/gemini-3.1-flash-lite-preview',
  instructions: `You are a structured-data extractor for a personal assistant's Life Graph.
You receive a free-form prose analysis of emails. Each claim is annotated inline with the message id(s) it came from in square brackets, e.g. "[msg_123]" or "[msg_124, msg_125]". You must propagate these ids onto every structured item you produce, in a "sourceMessageIds" array.

The input may also include the existing "dossier" (markdown) for the primary entity and other entities the system already knows about. When that is present, your "dossier" output for those entities must be the COMPLETE updated dossier — preserve every dated claim and every [msg_xxx] citation from the existing dossier verbatim unless the new prose contradicts it. If the new prose contradicts an existing claim, keep both with their dates and let the reader pick the latest. Do not silently drop information.

Return a JSON object with the shape:
{
  "entityUpdates": [
    {
      "label": "Niti Patel",
      "email": "nitivachhani@gmail.com",
      "type": "person",
      "relationshipClass": "family",
      "dossier": "- Spouse of the mailbox owner [msg_123].\\n- Works at Twilio (nitivachhani@twilio.com) [msg_124, msg_125].",
      "sourceMessageIds": ["msg_123", "msg_124", "msg_125"]
    }
  ],
  "newEntities": [
    {
      "label": "Hriyaan Patel",
      "type": "person",
      "relationshipClass": "family",
      "dossier": "- 5 years old as of 2026-04 [msg_123].\\n- Vegetarian [msg_123].\\n- Has weekly soccer class at Irvington Community Center, Saturdays 8-9am, April 18 – May 17 2026 [msg_127].",
      "sourceMessageIds": ["msg_123", "msg_127"]
    },
    {
      "label": "169152 Alder",
      "type": "asset",
      "dossier": "- Property at 169152 Alder, owned by the mailbox owner [msg_124].",
      "sourceMessageIds": ["msg_124"]
    }
  ],
  "relationships": [
    {
      "fromEntityLabel": "Niti Patel",
      "slot": "spouse_of",
      "toEntityLabel": "Kevin Patel",
      "sourceMessageIds": ["msg_123"]
    },
    {
      "fromEntityLabel": "Niti Patel",
      "slot": "parent_of",
      "toEntityLabel": "Hriyaan Patel",
      "sourceMessageIds": ["msg_123"]
    }
  ],
  "events": [
    {
      "label": "Anvay's 5th Birthday",
      "startTime": "2026-05-03T11:00:00",
      "endTime": "2026-05-03T13:30:00",
      "location": "Hiller Aviation Museum, San Carlos, CA",
      "participantEmails": ["nitivachhani@gmail.com"],
      "isRecurring": false,
      "sourceMessageIds": ["msg_125"]
    },
    {
      "label": "Hriyaan's Soccer (Rege's Academy)",
      "startTime": "2026-04-18T08:00:00",
      "endTime": "2026-04-18T09:00:00",
      "location": "Irvington Comm. Center",
      "participantEmails": ["nitivachhani@gmail.com"],
      "isRecurring": true,
      "recurrenceRule": "every Saturday 8-9am, April 18 – May 17 2026",
      "seriesEndDate": "2026-05-17",
      "sourceMessageIds": ["msg_127"]
    }
  ],
  "commitments": [
    {
      "label": "Resolve Hedges Dr water bill dispute",
      "dueDate": "2026-04-30",
      "owedByUser": true,
      "owedToEntityLabel": "Richmond American Homes",
      "sourceMessageIds": ["msg_126"]
    }
  ]
}

Rules:
- entityUpdates: patches to the *primary* entity or to entities you can clearly identify by email — name, type, relationshipClass, dossier.
- newEntities: every secondary person, organization, asset, etc. mentioned that is not the primary entity. Use type "person" | "organization" | "asset" | "household".
- dossier: a free-form markdown body capturing what is known about that entity. Group related claims, keep prose tight, and tag every claim with [msg_xxx] citations. Stable facts (job, food_preference, age, address, etc.) live here — do not split them into separate fields. Omit dossier when you have nothing to add or update for that entity.
- relationships: entity-to-entity links. Use slot names like spouse_of, parent_of, child_of, employs, attends, owns, lives_at. The fromEntityLabel and toEntityLabel must match labels you produced in entityUpdates / newEntities (or that the system already knows).
- events: time-anchored happenings. Put time, location, participants, and recurrence directly on the event. Do NOT put meeting.time / meeting.location into a person's dossier — they belong on the event entity.
- commitments: action items with optional dueDate. owedByUser=true means the mailbox owner owes someone; false means someone owes the mailbox owner. owedToEntityLabel must be a label that appears in entityUpdates or newEntities (or one already known to the system). dueDate is an ISO date.
- All datetimes are ISO 8601 strings. Resolve relative references using the dates the prose itself mentions.
- Every item MUST have a sourceMessageIds array containing the message ids the prose tagged for that claim. Use the exact strings (e.g. "msg_123") as they appear in the prose.
- Only include things you are confident about. Omit uncertain or speculative items.
- Return only valid JSON, no markdown fences.`,
});
