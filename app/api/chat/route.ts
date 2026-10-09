import { streamText } from 'ai'
import { fail, readJson } from '@/lib/http'
import { currentUser } from '@/lib/auth/guard'
import { languageModel } from '@/lib/llm'
import { recallForTurn } from '@/lib/memory/recall'
import { formatMemoryBlock } from '@/lib/memory/block'
import { extractAndStore } from '@/lib/memory/extract'
import { buildSystemPrompt, workspaceId } from '@/config/shop'
import { appendTurn, ensureConversation, recentTurns, touchUser } from '@/lib/db/repo'

export const runtime = 'nodejs'
export const maxDuration = 60

/** Tight cutoff for what the chip may call "remembered". See the note below. */
const REMEMBERED_DISTANCE = 0.7

type Body = { message?: string; conversationId?: string }

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) return fail('unauthorized', 'Not signed in', 401)

  const body = await readJson<Body>(request)
  const message = body?.message?.trim() ?? ''
  if (!message) return fail('invalid_input', 'Message is required', 400)

  if (!process.env.LLM_API_KEY) {
    return fail('internal', 'LLM_API_KEY is not configured on the server', 500)
  }

  const conversation = await ensureConversation({
    id: body?.conversationId,
    groupId: workspaceId,
    userId: user.id,
    title: message,
  })

  const recall = await recallForTurn(workspaceId, user.id, message, 5)
  const memoryBlock = formatMemoryBlock(recall)
  const history = await recentTurns(conversation.id, 10)

  const messages = [
    ...history.map((turn) => ({
      role: turn.role as 'user' | 'assistant',
      content: turn.content,
    })),
    { role: 'user' as const, content: message },
  ]

  await appendTurn({
    groupId: workspaceId,
    userId: user.id,
    conversationId: conversation.id,
    role: 'user',
    content: message,
    recallCount: recall.count,
  })
  await touchUser(user.id)

  const result = streamText({
    model: languageModel(),
    system: buildSystemPrompt(memoryBlock),
    messages,
    onFinish: async ({ text }) => {
      await appendTurn({
        groupId: workspaceId,
        userId: user.id,
        conversationId: conversation.id,
        role: 'assistant',
        content: text,
        recallCount: 0,
      })
      await extractAndStore({
        groupId: workspaceId,
        userId: user.id,
        userMessage: message,
        assistantReply: text,
      })
    },
  })

  return result.toUIMessageStreamResponse({
    headers: {
      'X-Conversation-Id': conversation.id,
      // Only what is about this customer or the shop counts as "remembered".
      // Catalogue lookups are reference material, and counting them made the
      // chip show a meaningless constant on every turn.
      // Only memories about this customer count as "remembered". Shop-wide
      // learnings and catalogue lookups are not things Reggie remembered
      // about them, and counting them made the chip fire on every turn.
      // A memory only counts as "remembered" when it clearly matches, not
      // merely when it is the nearest row. Measured on this embedding model, a
      // genuinely relevant personal fact lands at distance 0.38-0.69 while an
      // unrelated one sits at 0.71-0.83. Without this tighter cutoff the chip
      // fired on almost every message, including "hello".
      'X-Recall-Count': String(
        recall.personal.filter((memory) => memory.distance <= REMEMBERED_DISTANCE).length,
      ),
      'X-Memory-Status': recall.status,
    },
  })
}
