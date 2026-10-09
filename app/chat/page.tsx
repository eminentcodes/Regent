import type { Metadata } from 'next'
import { ChatScreen } from '@/app/_components/chat/chat-screen'

export const metadata: Metadata = { title: 'Chat with Reggie' }

export default async function ChatPage({ searchParams }: {
  searchParams: Promise<{ message?: string | string[] }>
}) {
  const { message } = await searchParams
  const initialDraft = typeof message === 'string' ? message.slice(0, 8000).trim() : ''
  return <ChatScreen key={initialDraft} initialDraft={initialDraft} />
}
