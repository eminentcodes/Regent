import type { StoreProduct } from '@/app/_lib/store'

/**
 * The basket is the working order for one conversation.
 *
 * It is built from what the customer actually said in this conversation, matched
 * against the store catalogue so the prices are the store's own. Nothing is
 * invented: an item only appears if the customer named it, and "my usual" pulls
 * the standing order back out of Walrus Memory.
 */

export type BasketLine = {
  id: string
  name: string
  title: string
  size: string
  quantity: number
  unitPrice: number
  total: number
  fromMemory: boolean
}

export type Basket = {
  lines: BasketLine[]
  total: number
  count: number
  fromMemory: boolean
}

const WORD_NUMBERS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, twelve: 12, dozen: 12,
}

const ADD = /\b(add|i need|i want|i would like|i'?d like|get me|buy|order|bring|send|send me|grab|pick up|include|plus|also|and)\b/i
const QUESTION = /\b(how much|price of|do you (have|sell|stock)|is it available|is there|what do you have|any)\b/i
const USUAL = /\b(my usual|the usual|my regular|my regular order|same as always|save (this|that) as my usual|remember (this|that) list|my normal order)\b/i
const REMOVE = /\b(remove|delete|cancel|take (out|off)|drop|no longer|forget|clear)\b/i

const MEASURES = '(?:x|×|bags?|crates?|packs?|tins?|bunches?|loaves?|rolls?|pieces?|pcs|kg|kgs|kilos?|grams?|g|litres?|liters?|l|dozen|cups?)'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** The word a customer is most likely to use for a product: "Rice", "Beans", "Tomatoes". */
function headOf(product: StoreProduct): string {
  const words = product.title.split(/\s+/).filter(Boolean)
  if (words.length === 0) return product.name
  const first = words[0].replace(/[^A-Za-z]/g, '')
  const second = words[1]?.replace(/[^A-Za-z]/g, '')
  // "Fresh tomatoes" and "Cow meat" read as one thing to a customer.
  if (second && ['Fresh', 'Cow', 'Goat', 'Palm', 'Ground', 'Whole'].includes(first)) return first + ' ' + second
  return first
}

function numberFrom(word: string): number | null {
  const lower = word.toLowerCase()
  if (WORD_NUMBERS[lower] !== undefined) return WORD_NUMBERS[lower]
  const value = Number.parseFloat(lower.replace(',', '.'))
  return Number.isFinite(value) && value > 0 ? value : null
}

function quantityIn(message: string, head: string): number | null {
  const h = escapeRegExp(head)
  const patterns = [
    new RegExp('(\\d+(?:[.,]\\d+)?)\\s*' + MEASURES + '?\\s*(?:of\\s+)?' + h, 'i'),
    new RegExp('\\b(a|an|one|two|three|four|five|six|seven|eight|nine|ten|twelve|dozen)\\s*' + MEASURES + '?\\s*(?:of\\s+)?' + h, 'i'),
    new RegExp(h + '\\s*(?:x|×)\\s*(\\d+(?:[.,]\\d+)?)', 'i'),
  ]
  for (const pattern of patterns) {
    const match = pattern.exec(message)
    if (match) {
      const value = numberFrom(match[1])
      if (value) return Math.min(value, 99)
    }
  }
  return null
}

/** Products the customer named in this message, with the quantity they gave. */
function linesIn(message: string, products: StoreProduct[]): { product: StoreProduct; quantity: number }[] {
  const found: { product: StoreProduct; quantity: number }[] = []
  for (const product of products) {
    const head = headOf(product)
    if (head.length < 3) continue
    const pattern = new RegExp('\\b' + escapeRegExp(head) + 's?\\b', 'i')
    if (!pattern.test(message)) continue
    found.push({ product, quantity: quantityIn(message, head) ?? 1 })
  }
  return found
}

function merge(lines: BasketLine[], product: StoreProduct, quantity: number, fromMemory: boolean, mode: 'set' | 'add' | 'remove') {
  const existing = lines.find((line) => line.id === product.id)
  if (mode === 'remove') {
    const index = lines.indexOf(existing as BasketLine)
    if (index >= 0) lines.splice(index, 1)
    return
  }
  if (existing) {
    existing.quantity = mode === 'add' ? Math.min(99, existing.quantity + quantity) : quantity
    existing.total = existing.quantity * existing.unitPrice
    existing.fromMemory = existing.fromMemory && fromMemory
    return
  }
  lines.push({
    id: product.id,
    name: product.name,
    title: product.title,
    size: product.size,
    quantity,
    unitPrice: product.price,
    total: quantity * product.price,
    fromMemory,
  })
}

/**
 * The customer's own words, in order. A later turn replaces an earlier quantity
 * for the same item, "more" adds to it, and "remove" takes it out.
 */
export function buildBasket(input: {
  messages: string[]
  memoryTexts: string[]
  products: StoreProduct[]
}): Basket {
  const lines: BasketLine[] = []
  let fromMemory = false

  for (const message of input.messages) {
    const text = message.trim()
    if (!text) continue

    if (USUAL.test(text)) {
      fromMemory = true
      for (const memory of input.memoryTexts) {
        for (const { product, quantity } of linesIn(memory, input.products)) {
          merge(lines, product, quantity, true, 'set')
        }
      }
    }

    if (QUESTION.test(text) && !ADD.test(text)) continue

    for (const { product, quantity } of linesIn(text, input.products)) {
      const mode = REMOVE.test(text) ? 'remove' : /\b(more|another|extra)\b/i.test(text) ? 'add' : 'set'
      merge(lines, product, quantity, false, mode)
    }
  }

  const total = lines.reduce((sum, line) => sum + line.total, 0)
  return {
    lines,
    total,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    fromMemory: fromMemory && lines.some((line) => line.fromMemory),
  }
}
