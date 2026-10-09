/**
 * Memory taxonomy. Every stored memory carries a tag so recall can be
 * explained to the user, and so the shared tier can be audited for leaks.
 */

export const MEMORY_TAGS = ["profile", "pref", "event", "issue"] as const
export type MemoryTag = (typeof MEMORY_TAGS)[number]

export type ParsedFact = {
  tag: MemoryTag
  text: string
}

const TAG_PREFIX = /^\[(profile|pref|event|issue)\]\s*/i

export function formatFact(tag: MemoryTag, text: string): string {
  return "[" + tag + "] " + text.trim()
}

export function parseFact(value: string): ParsedFact {
  const trimmed = value.trim()
  const match = TAG_PREFIX.exec(trimmed)

  if (!match) {
    return { tag: "pref", text: trimmed }
  }

  return {
    tag: match[1].toLowerCase() as MemoryTag,
    text: trimmed.slice(match[0].length).trim(),
  }
}

const EMAIL_LIKE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/
const PHONE_LIKE = /(\+?\d[\d\s().-]{7,}\d)/
const LONG_DIGITS = /\d{6,}/

/**
 * Guardrail for the shared tier. Nothing that looks like personal contact
 * data or an identifier may be promoted to the group namespace.
 */
export function looksPersonal(value: string): boolean {
  return (
    EMAIL_LIKE.test(value) ||
    PHONE_LIKE.test(value) ||
    LONG_DIGITS.test(value)
  )
}
