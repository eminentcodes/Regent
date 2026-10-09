import type { MemoryTag } from './taxonomy'

/**
 * Deterministic safety net under the model.
 *
 * The model reads an exchange and decides what is worth keeping. That call can
 * fail, time out, or come back with an empty list, and when it does the detail
 * the customer just gave must still reach Walrus. These rules are the one path
 * where something about the customer is recorded by code alone: if a message
 * states something about the person, one of them matches.
 *
 * Order matters. The first match wins, so the most consequential reading of a
 * message is listed first.
 */
const RULES: { tag: MemoryTag; pattern: RegExp }[] = [
  {
    tag: 'issue',
    pattern: /\b(complaint|complain|wrong item|damaged|spoilt|spoiled|expired|refund|not happy|problem with|never arrived|went bad)\b/i,
  },
  {
    tag: 'event',
    pattern: /\b(last week|last time|the other day|yesterday|my last order|you delivered|you sent|you brought)\b/i,
  },
  {
    tag: 'profile',
    pattern: /\b(i live (in|at|on)|i stay (in|at)|i'?m based (in|at)|i am based (in|at)|my address is|my house is|my area is|my name is|call me|my (wife|husband|son|daughter|children|kids|family|mum|mom|dad|brother|sister)|there are \w+ of us)\b/i,
  },
  {
    // An order is the thing a customer is most likely to ask about later, so it
    // is remembered rather than treated as noise.
    tag: 'event',
    pattern: /\b(i ordered|i want to order|i'?d like to order|i want|i need|i would like|add|get me|send me|bring me|bring|pick up|collect|i'?m ordering|please deliver|deliver (it|them) to|drop (it|them) off)\b/i,
  },
  {
    tag: 'pref',
    pattern: /\b(i always|i usually|i normally|i only buy|my usual|my regular|same as always|i prefer|i like|i love|my favou?rite|every week|every month|i never|i do not eat|i don'?t eat|i can'?t eat|i cannot eat|allergic|vegetarian|vegan|dairy[- ]free|gluten[- ]free|no pork|no beef|i do not want|i don'?t want|do not send|don'?t send|never send)\b/i,
  },
]

const MIN_LENGTH = 8
const MAX_LENGTH = 400

/** A question is not a fact about the customer. An order is. */
const QUESTION_ONLY = /\b(how much|do you (have|sell|stock)|is it available|what time|opening hours|delivery fee)\b/i
/** ...unless they said it lasts, or asked for it to be kept. */
const STANDING = /\b(always|usually|normally|every week|every month|my usual|my regular|prefer|allergic|vegetarian|vegan|i never|remember|save)\b/i

function firstSentence(message: string): string {
  const single = message.replace(/\s+/g, ' ').trim()
  const match = single.match(/^[\s\S]*?[.!?](?=\s|$)/)
  const value = match && match[0].trim().length >= MIN_LENGTH ? match[0].trim() : single
  return value.length > MAX_LENGTH ? value.slice(0, MAX_LENGTH).trim() + '...' : value
}

/**
 * The strongest thing the customer said about themselves in this message, or
 * null when the message is small talk, a question, or a plain order.
 */
export function fallbackFact(message: string): { tag: MemoryTag; text: string } | null {
  const value = firstSentence(message)
  if (value.length < MIN_LENGTH) return null
  if (QUESTION_ONLY.test(value) && !STANDING.test(value)) return null

  const rule = RULES.find((candidate) => candidate.pattern.test(value))
  if (!rule) return null

  return {
    tag: rule.tag,
    text: 'The customer said: "' + value.replace(/^["'\s]+|["'\s]+$/g, '') + '"',
  }
}