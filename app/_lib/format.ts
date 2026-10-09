export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const DAY = 86_400_000

/** "Today", "Yesterday", or a short date. Used to group memory lists. */
export function formatDay(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Earlier'

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const time = date.getTime()

  if (time >= startOfToday) return 'Today'
  if (time >= startOfToday - DAY) return 'Yesterday'
  if (time >= startOfToday - DAY * 6) return 'Earlier this week'
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatRelative(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const diff = Date.now() - date.getTime()
  const minutes = Math.round(diff / 60_000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return minutes + ' min ago'

  const hours = Math.round(minutes / 60)
  if (hours < 24) return hours === 1 ? '1 hour ago' : hours + ' hours ago'

  const days = Math.round(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 30) return days + ' days ago'

  return formatDate(iso)
}

export function initialsOf(value: string): string {
  const clean = value.trim()
  if (!clean) return '?'
  return clean[0].toUpperCase()
}
const IRREGULAR_VERBS: Record<string, string> = {
  is: 'are',
  has: 'have',
  does: 'do',
  goes: 'go',
  was: 'were',
  says: 'say',
}

const LEADING_ADVERB = /^(?:always|usually|often|never|sometimes|only|really|still|just)\s+/
const THIRD_PERSON_VERB = /^(?:is|has|does|goes|was|says|[a-z]+s)$/

function toSecondPersonVerb(verb: string): string {
  const irregular = IRREGULAR_VERBS[verb]
  if (irregular) return irregular
  if (verb.endsWith('ies') && verb.length > 4) return verb.slice(0, -3) + 'y'
  if (/(?:ches|shes|sses|xes|zes|oes)$/.test(verb)) return verb.slice(0, -2)
  if (verb.endsWith('s') && !verb.endsWith('ss')) return verb.slice(0, -1)
  return verb
}

function convertPredicate(predicate: string): string | null {
  const adverbMatch = predicate.match(LEADING_ADVERB)
  const adverb = adverbMatch ? adverbMatch[0] : ''
  const remainder = predicate.slice(adverb.length)

  const verbMatch = remainder.match(/^([A-Za-z]+)([\s\S]*)$/)
  if (!verbMatch || !THIRD_PERSON_VERB.test(verbMatch[1])) return null

  return 'You ' + adverb + toSecondPersonVerb(verbMatch[1]) + verbMatch[2]
}

/**
 * Memories are written in the third person because the model reads them about
 * the customer. Reading "Ada lives in Yaba" in your own panel is wrong, so on
 * the customer-facing side we say "You" instead.
 */
export function secondPerson(text: string): string {
  const trimmed = text.trim()

  const possessive = trimmed.match(/^The customer's\s+([\s\S]+)$/i)
  if (possessive) return 'Your ' + possessive[1]

  const customer = trimmed.match(/^The customer\s+([\s\S]+)$/i)
  if (customer) return convertPredicate(customer[1]) ?? trimmed

  const named = trimmed.match(/^([A-Z][A-Za-z'\u2019-]+)\s+([\s\S]+)$/)
  if (named) return convertPredicate(named[2]) ?? trimmed

  return trimmed
}