import { parseFact } from '@/lib/memory/taxonomy'
import type { RecallOutcome, RecalledMemory } from '@/lib/memory/recall'

/**
 * Turns a recall outcome into the block we hand to the model. Keeping this
 * separate from the recall call makes it easy to change how memory is phrased
 * without touching the network layer.
 *
 * The headings matter. Only the personal section describes the customer;
 * everything else is reference material. An earlier version labelled them
 * neutrally ("Store information"), and the model folded catalogue rows into
 * the customer's own "usual order", so each heading now states what it is and
 * what it is not.
 */
function render(hits: RecalledMemory[]): string[] {
  return hits.map((hit) => '- ' + parseFact(hit.text).text)
}

export function formatMemoryBlock(outcome: RecallOutcome): string {
  if (outcome.status !== 'ok' || outcome.count === 0) return ''

  const lines: string[] = ['Reference material recalled for this turn.']

  if (outcome.personal.length > 0) {
    lines.push(
      '',
      'About this customer - the only facts you know about them:',
      ...render(outcome.personal),
    )
  }

  if (outcome.shared.length > 0) {
    lines.push(
      '',
      'Notes the shop keeps in general - not facts about this customer:',
      ...render(outcome.shared),
    )
  }

  if (outcome.knowledge.length > 0) {
    lines.push(
      '',
      "Store information - the catalogue, prices and policies of what the shop sells. This is not the customer's order, basket or usual:",
      ...render(outcome.knowledge),
    )
  }

  return lines.join('\n')
}