import type { Metadata } from 'next'
import { ChatScreen } from '@/app/_components/chat/chat-screen'

export const metadata: Metadata = { title: 'Chat with Reggie' }

export default async function ChatPage({ searchParams }: {
  searchParams: Promise<{ message?: string | string[]; send?: string | string[] }>
}) {
  const { message, send } = await searchParams
  const initialDraft = typeof message === 'string' ? message.slice(0, 8000).trim() : ''
  const autoSend = send === '1' || send === 'true'
  return <ChatScreen key={initialDraft} initialDraft={initialDraft} autoSend={autoSend} />
}