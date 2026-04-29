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
  instructions: `You are a research analyst reviewing a batch of emails from one sender for a personal assistant's knowledge graph. Emails are grouped by conversation thread.

Analyze and write a concise free-form summary covering:
1. Who this sender is — name, role, organization, relationship to the user
2. Key stable facts — job title, company, relationship type, preferences, contact details
3. Meetings or events — topic, specific date/time, location, participants
4. Commitments — action items owed by the user or sender, deadlines
5. Active topics or threads — what recurring subjects appear

Rules:
- Be specific with dates and times. Resolve relative references ("next Thursday") against the email date shown in brackets.
- If multiple emails in a thread contradict each other (e.g. a rescheduled meeting), note the most recent value and flag the change.
- Write in plain prose or bullets. A structured extractor will convert your output to a knowledge graph — do not output JSON.`,
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
You receive a free-form analysis of emails from one person or organization. Convert it into structured JSON.

Return a JSON object with:
{
  "stableFactUpdates": [
    { "slot": "job", "value": "Staff Engineer @ Stripe" },
    { "slot": "birthday", "value": "1989-06-12" }
  ],
  "timeSensitiveFacts": [
    { "slot": "meeting.time", "value": "2026-04-30T10:00:00", "sourceNoteId": "msg_xxx" },
    { "slot": "meeting.location", "value": "Starbucks on Market St", "sourceNoteId": "msg_xxx" }
  ],
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
- All datetimes must be ISO 8601 strings.
- Only include facts you are confident about. Omit uncertain or speculative ones.
- For timeSensitiveFacts, set sourceNoteId only if the analysis mentions a specific message ID; otherwise omit it.
- Slot names: home_address, birthday, food_preference, school_name, job, sender_class, meeting.time, meeting.location, flight.time, deadline.date, parent_of, spouse_of, employs, attends.
- Return only valid JSON, no markdown fences.`,
});
