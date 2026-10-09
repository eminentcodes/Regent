import { fail, ok } from '@/lib/http'
import { currentUser } from '@/lib/auth/guard'
import { listMemories, recentTurns } from '@/lib/db/repo'
import { getStoreCatalogue } from '@/app/_lib/catalogue'
import { buildBasket } from '@/lib/basket'
import { parseFact } from '@/lib/memory/taxonomy'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * The basket for one conversation: what the customer asked for in this session,
 * priced with the store catalogue, plus their standing order when they called
 * it their usual.
 */
export async function GET(request: Request) {
  const user = await currentUser()
  if (!user) return fail('unauthorized', 'Not signed in', 401)

  const conversationId = new URL(request.url).searchParams.get('conversationId')
  const [catalogue, memories] = await Promise.all([
    getStoreCatalogue(),
    listMemories(user.id),
  ])

  const messages = conversationId
    ? (await recentTurns(conversationId, 60)).filter((turn) => turn.role === 'user').map((turn) => turn.content)
    : []

  const basket = buildBasket({
    messages,
    memoryTexts: memories.map((row) => parseFact(row.text).text),
    products: catalogue.products,
  })

  return ok(basket)
}