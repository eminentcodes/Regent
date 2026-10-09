import { generateText } from 'ai'
import { z } from 'zod'
import { memwal, personalNamespace, sharedNamespace } from '@/lib/memwal'
import { languageModel } from '@/lib/llm'
import { confirmMemoryBlob, pendingBlobJobs, recordMemory } from '@/lib/db/repo'
import { MEMORY_TAGS, formatFact, looksPersonal } from './taxonomy'
import { fallbackFact } from './patterns'

/**
 * Extraction is where memory quality is won or lost. We own it instead of
 * delegating it, so we can tag facts, keep the shared tier clean, and tell a
 * customer why something was remembered.
 */

const factSchema = z.object({
  facts: z.array(
    z.object({
      tag: z.enum(MEMORY_TAGS),
      scope: z.enum(['personal', 'shared']),
      text: z.string().min(3).max(240),
    }),
  ),
})

const EXTRACTION_SYSTEM = [
  'You extract durable facts from one exchange between a customer and a grocery shop bot.',
  '',
  'Always look for these, they are the point of the exercise:',
  '- Identity and household: their name, the area they live in, who they shop for, family.',
  '- What they buy and how they like it: standing likes and dislikes.',
  '- Their usual basket: when they hand over a list and call it their standing order, store the whole basket as one preference. Phrases that make a list standing: "this is my usual", "my usual order", "my regular order", "what I always get", "same as always", "remember this list for me", "save this as my usual". Write one sentence with the items and quantities, for example "The usual order for this customer is 2 x Brown Honey Beans and 1 x Rice.".',
  '- Constraints and safety: allergies, dietary needs, things they never want sent.',
  '- Problems: a complaint, a bad delivery, anything still unresolved.',
  '- Anything else important they tell you about themselves that will still matter next visit.',
  '',
  'The one thing to exclude:',
  '- An order IS worth remembering. When the customer asks to buy something, store one event fact with the items and quantities, because they will come back and ask about it later. "I want 2kg rice and beans" -> {"tag":"event","scope":"personal","text":"The customer ordered 2kg of rice and beans."}.',
  '- When they call the list their usual, their regular order, or ask you to remember it, store it as a preference instead of an event.',
  '- Do not turn a single order into a habit by yourself. Only record a preference when they say it lasts: always, usually, every week, I prefer, I never want, I am allergic to, do not send me, my usual, my regular order.',
  '',
  'Which tag:',
  '- profile: who they are and where they live. Name, area, household, who they shop for.',
  '- pref: a standing like or dislike about how they shop.',
  '- event: a one-off that is still worth remembering, such as an unresolved complaint.',
  '- issue: a problem, a complaint, or something that needs fixing.',
  '',
  'Rules:',
  '- Write each fact as a short third-person sentence.',
  '- The subject is always the customer, written as "The customer" or by their name if they gave one. Never write the assistant (Reggie) as the subject. Reggie is the bot. A fact about the customer must never be attributed to Reggie.',
  '- Only things the customer said about themselves count. Never turn words spoken by the bot, or its suggestions and small talk, into a fact about the customer.',
  '- Never store greetings, small talk, or anything you had to guess.',
  '- A question is not a fact. Asking whether you deliver to Ikeja says nothing about where the customer lives. Asking the price of rice says nothing about what they buy.',
  '- Never store a running total, an order summary, or a delivery slot as a preference. Those belong to the order, not the customer.',
  '- NEVER store shop information. Prices, products, catalogue items, delivery zones and fees, and opening hours already live in the store knowledge base. The bot reciting them is not a memory.',
  '- scope personal means the fact is about this customer. If they told you about themselves, it is personal.',
  '- scope shared is rare and never about one customer. Use it only for a genuinely new shop-wide insight that is not shop information and cannot identify anyone.',
  '- NEVER put names, emails, phone numbers, addresses or account ids into a shared fact.',
  '- Extract every fact worth keeping from this exchange, not just one. An empty facts array is only for exchanges where they told you nothing about themselves.',
  '- When in doubt, store it. The failure that matters is leaving out something the customer told you about themselves, not adding one detail too many.',
  '- A fact can be small. A name, a street, a child who likes a snack, a brand they trust, a time they prefer. Anything that would be useful to know next visit is worth storing.',
  '',
  'Examples of the right output:',
  '- Customer: "I live at 12 Admiralty Way, Lekki" -> {"tag":"profile","scope":"personal","text":"The customer lives at 12 Admiralty Way, Lekki."}',
  '- Customer: "my daughter loves the plantain chips" -> {"tag":"profile","scope":"personal","text":"The customer has a daughter who loves plantain chips."}',
  '- Customer: "my usual is 2 x brown beans and 1 x rice" -> {"tag":"pref","scope":"personal","text":"The usual order for this customer is 2 x brown beans and 1 x rice."}',
  '- Customer: "I am allergic to peanuts" -> {"tag":"pref","scope":"personal","text":"The customer is allergic to peanuts."}',
  '- Customer: "you delivered my rice late last week" -> {"tag":"issue","scope":"personal","text":"The customer had a late delivery last week."}',
  '- Customer: "hi, how much is rice" -> {"facts":[]}',
].join('\n')

const JSON_CONTRACT =
  'Reply with JSON only, no prose and no code fences, exactly in this shape: ' +
  '{"facts":[{"tag":"pref","scope":"personal","text":"..."}]}'

export type ExtractOutcome = {
  status: 'ok' | 'degraded'
  written: number
  shared: number
  reason?: string
}

type PreparedFact = {
  text: string
  tag: string
  scope: 'personal' | 'shared'
  namespace: string
}

type Facts = z.infer<typeof factSchema>

/**
 * Some OpenRouter backends advertise structured outputs but drop the schema on
 * the floor, so `generateObject` alone is not dependable. We try it, then fall
 * back to plain text we parse ourselves.
 */
async function readFacts(prompt: string): Promise<Facts | null> {
  // This provider accepts the request but ignores the JSON schema, so schema
  // enforcement is not something we can rely on. We ask for JSON in plain text
  // and parse it ourselves, which works across every model we can point at.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { text } = await generateText({
        model: languageModel(),
        system: EXTRACTION_SYSTEM + '\n\n' + JSON_CONTRACT,
        prompt,
      })

      const facts = parseFacts(text)
      if (facts) return facts
    } catch {
      // Transient model or network failure. Try once more before giving up.
    }
  }

  return null
}
function parseFacts(raw: string): Facts | null {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start < 0 || end <= start) return null

  try {
    const parsed = factSchema.safeParse(JSON.parse(raw.slice(start, end + 1)))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export async function extractAndStore(input: {
  groupId: string
  userId: string
  userMessage: string
  assistantReply: string
}): Promise<ExtractOutcome> {
  try {
    const prompt =
      'Customer said:\n' + input.userMessage + '\n\nBot replied:\n' + input.assistantReply
    const facts = await readFacts(prompt)

    if (!facts) {
      return { status: 'degraded', written: 0, shared: 0, reason: 'model returned no usable JSON' }
    }

    const prepared: PreparedFact[] = []

    for (const fact of facts.facts) {
      const tagged = formatFact(fact.tag, fact.text)
      const isShared = fact.scope === 'shared'

      // Guardrail: nothing personal is ever promoted to the shop namespace.
      if (isShared && looksPersonal(tagged)) continue

      prepared.push({
        text: tagged,
        tag: fact.tag,
        scope: isShared ? 'shared' : 'personal',
        namespace: isShared
          ? sharedNamespace(input.groupId)
          : personalNamespace(input.groupId, input.userId),
      })
    }

    if (prepared.length === 0) {
      // Safety net. The model is the good reader of an exchange, but a detail
      // about the customer must never be lost because that call failed, timed
      // out, or came back empty. This path records it by rule instead.
      const rescued = fallbackFact(input.userMessage)
      if (rescued) {
        prepared.push({
          text: formatFact(rescued.tag, rescued.text),
          tag: rescued.tag,
          scope: 'personal',
          namespace: personalNamespace(input.groupId, input.userId),
        })
      }
    }

    if (prepared.length === 0) {
      return { status: 'ok', written: 0, shared: 0 }
    }

    // One batched request keeps us inside the relayer rate limit, which is per
    // delegate key and easy to trip with one write per fact.
    const accepted = await memwal().rememberBulk(
      prepared.map((fact) => ({ text: fact.text, namespace: fact.namespace })),
    )

    for (let index = 0; index < prepared.length; index += 1) {
      const fact = prepared[index]
      await recordMemory({
        groupId: input.groupId,
        userId: input.userId,
        namespace: fact.namespace,
        scope: fact.scope,
        text: fact.text,
        tag: fact.tag,
        jobId: accepted.job_ids[index] ?? null,
      })
    }

    // Walrus confirms a blob after the relayer accepts the job. Attaching the
    // real blob id is what proves the fact is on Walrus, not just in our table.
    void confirmBlobs(accepted.job_ids)

    return {
      status: 'ok',
      written: prepared.length,
      shared: prepared.filter((fact) => fact.scope === 'shared').length,
    }
  } catch (error) {
    return {
      status: 'degraded',
      written: 0,
      shared: 0,
      reason: error instanceof Error ? error.message : 'extraction failed',
    }
  }
}

/**
 * Follows accepted write jobs until Walrus hands back a blob id, then records
 * it. Deliberately not awaited: the reply has already reached the customer, and
 * a slow relayer must never hold the request open.
 */
async function confirmBlobs(jobIds: string[]): Promise<void> {
  const pending = new Set(jobIds.filter(Boolean))
  const deadline = Date.now() + 120_000

  while (pending.size > 0 && Date.now() < deadline) {
    try {
      const status = await memwal().getRememberBulkStatus([...pending])

      for (const item of status.results) {
        if (item.status === 'done' && item.blob_id) {
          await confirmMemoryBlob(item.job_id, item.blob_id)
          pending.delete(item.job_id)
          continue
        }
        if (item.status === 'failed' || item.status === 'not_found') {
          pending.delete(item.job_id)
        }
      }
    } catch {
      return
    }

    if (pending.size === 0) return
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }
}

/**
 * Runs the confirmation check on demand instead of in the background.
 *
 * A serverless function is frozen as soon as its response is sent, so the
 * fire-and-forget poll above cannot finish there and blob ids would never be
 * attached. Calling this from a route that is already serving a request gives
 * the check a live process to run in.
 */
export async function confirmPendingBlobs(userId: string): Promise<number> {
  try {
    const jobIds = await pendingBlobJobs(userId)
    if (jobIds.length === 0) return 0

    const status = await memwal().getRememberBulkStatus(jobIds)
    let confirmed = 0
    for (const item of status.results) {
      if (item.status === 'done' && item.blob_id) {
        await confirmMemoryBlob(item.job_id, item.blob_id)
        confirmed += 1
      }
    }
    return confirmed
  } catch {
    return 0
  }
}