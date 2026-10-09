'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import type { RecallStatus } from '@/app/_lib/types'
import { useSession } from '../session-provider'

export type RecallNote = { count: number; status: RecallStatus }

function lastUserText(messages: UIMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (message.role !== 'user') continue
    return message.parts.filter((part) => part.type === 'text')
      .map((part) => (part as { type: 'text'; text: string }).text).join('\n').trim()
  }
  return ''
}

export function useThread() {
  const session = useSession()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [recallNotes, setRecallNotes] = useState<RecallNote[]>([])
  const [memoryStatus, setMemoryStatus] = useState<RecallStatus>('ok')

  // The transport owns its request identity. Its callbacks run at request time,
  // so render never reads or mutates a ref.
  const [connection] = useState(() => {
    let requestConversationId: string | null = null
    return {
      reset: () => { requestConversationId = null },
      transport: new DefaultChatTransport<UIMessage>({
        api: '/api/chat',
        prepareSendMessagesRequest: ({ messages }) => {
          const body: { message: string; conversationId?: string } = { message: lastUserText(messages) }
          if (requestConversationId) body.conversationId = requestConversationId
          return { body }
        },
        fetch: async (input, init) => {
          const response = await fetch(input, init)
          // A late 401 means the session lapsed: re-check it so the customer
          // sees the sign-in prompt instead of a dead error.
          if (response.status === 401) void session.reload()
          const nextId = response.headers.get('X-Conversation-Id')
          if (nextId) {
            requestConversationId = nextId
            setConversationId(nextId)
          }
          if (response.ok) {
            const parsed = Number.parseInt(response.headers.get('X-Recall-Count') ?? '0', 10)
            const status: RecallStatus = response.headers.get('X-Memory-Status') === 'degraded' ? 'degraded' : 'ok'
            setRecallNotes((notes) => [...notes, { count: Number.isFinite(parsed) ? parsed : 0, status }])
            setMemoryStatus(status)
          }
          return response
        },
      }),
    }
  })
  const chat = useChat({ transport: connection.transport })
  function reset() {
    connection.reset()
    setConversationId(null)
    setRecallNotes([])
    setMemoryStatus('ok')
    chat.setMessages([])
    chat.clearError()
  }
  return {
    messages: chat.messages, status: chat.status, error: chat.error,
    sendMessage: chat.sendMessage, stop: chat.stop, regenerate: chat.regenerate,
    clearError: chat.clearError, conversationId, recallNotes, memoryStatus, reset,
  }
}