import { parseFact } from '@/lib/memory/taxonomy'
import type { RecallOutcome, RecalledMemory } from '@/lib/memory/recall'

/**
 * Turns a recall outcome into the block we hand to the model. Keeping this
 * separate from the recall call makes it easy to change how memory is phrased
 * without touching the network layer.
 */
function render(hits: RecalledMemory[]): string[] {
  return hits.map((hit) => '- ' + parseFact(hit.text).text)
}

export function formatMemoryBlock(outcome: RecallOutcome): string {
  if (outcome.status !== 'ok' || outcome.count === 0) return ''

  const lines: string[] = ['Relevant memory you already hold:']

  if (outcome.personal.length > 0) {
    lines.push('', 'About this customer:')
    lines.push(...render(outcome.personal))
  }

  if (outcome.shared.length > 0) {
    lines.push('', 'What the shop has learned from other customers:')
    lines.push(...render(outcome.shared))
  }

  if (outcome.knowledge.length > 0) {
    lines.push('', 'Store information:')
    lines.push(...render(outcome.knowledge))
  }

  return lines.join('\n')
}
