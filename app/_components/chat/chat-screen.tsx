'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Clock3, Leaf, MapPin, MessageCircle, Plus, ShoppingBasket, Sparkles, Truck } from 'lucide-react'
import { AppShell } from '../app-shell'
import { AssistantAvatar } from '../brand'
import { useSession } from '../session-provider'
import { Modal } from '../ui/modal'
import { buttonStyles, cx } from '../ui/primitives'
import { AuthGate, HeldMessage } from './auth-gate'
import { Composer } from './composer'
import { DayDivider, MessageBubble } from './message-bubble'
import { MemoryDegradedLine, TypingDots } from './recall-chip'
import { useThread } from './use-thread'
import { YourUsualPanel } from './your-usual-panel'
import { STORE_LOCATION } from '@/app/_lib/store'
import { api } from '@/app/_lib/api'
import type { MemoryList } from '@/app/_lib/types'

const PENDING_KEY = 'regent:pending-message'
const PROMPTS = [
  { title: 'Something fresh', hint: 'Find your everyday essentials', text: 'What fresh produce do you have today?', Icon: Leaf },
  { title: 'My usual, please', hint: 'Pick up where we left off', text: 'Can you help me put together my usual order?', Icon: ShoppingBasket },
  { title: 'Deliver to my door', hint: 'A little closer to home', text: 'Which areas do you deliver to, and how much does it cost?', Icon: Truck },
  { title: 'A quick question', hint: 'Get to know your local', text: 'What time do you open and close?', Icon: MessageCircle },
]
function rememberPending(value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(PENDING_KEY)
    else sessionStorage.setItem(PENDING_KEY, value)
  } catch { /* The inline gate also works without browser storage. */ }
}
function readPending(): string | null {
  try { return sessionStorage.getItem(PENDING_KEY) } catch { return null }
}

export function ChatScreen({ initialDraft = '', autoSend = false }: { initialDraft?: string; autoSend?: boolean }) {
  const { user } = useSession()
  // Account changes unmount the private thread, including any active stream.
  return <ChatWorkspace key={user?.id ?? 'guest'} initialDraft={initialDraft} autoSend={autoSend} />
}

function ChatWorkspace({ initialDraft, autoSend }: { initialDraft: string; autoSend: boolean }) {
  const session = useSession()
  const thread = useThread()
  const [draft, setDraft] = useState(autoSend ? '' : initialDraft)
  const [held, setHeld] = useState<string | null>(null)
  const [gateOpen, setGateOpen] = useState(false)
  const [focusToken, setFocusToken] = useState(0)
  const [sheetOpen, setSheetOpen] = useState(false)
  // Per reply: how much of what the customer just said reached Walrus Memory.
  const [saved, setSaved] = useState<Record<number, { count: number; blobUrl: string | null }>>({})
  const knownMemoryIds = useRef<Set<string> | null>(null)
  const stickRef = useRef(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const resumedRef = useRef(false)
  const busy = thread.status === 'submitted' || thread.status === 'streaming'

  const refreshToken = Math.floor((thread.messages.length - (busy ? 1 : 0)) / 2)

  useEffect(() => {
    const el = scrollRef.current
    if (el && stickRef.current) el.scrollTop = el.scrollHeight
  }, [thread.messages, thread.status, held, gateOpen])

  useEffect(() => {
    if (resumedRef.current || session.status === 'loading') return
    resumedRef.current = true
    // A shopping list handed over from the store goes straight to Reggie,
    // otherwise the message left waiting by the sign-in gate is sent.
    const pending = autoSend && initialDraft ? initialDraft : readPending()
    if (!pending) return
    if (session.status === 'user') {
      rememberPending(null)
      void thread.sendMessage({ text: pending })
      return
    }
    rememberPending(pending)
    // Browser storage must be restored after hydration, never during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeld(pending)
    setGateOpen(true)
  }, [session.status, thread, autoSend, initialDraft])

  async function handleSubmit(raw: string) {
    const value = raw.trim()
    if (!value || busy) return
    const status = session.status === 'loading' ? await session.reload() : session.status
    stickRef.current = true
    if (status !== 'user') {
      rememberPending(value)
      setHeld(value)
      setGateOpen(true)
      setDraft('')
      return
    }
    rememberPending(null)
    setHeld(null)
    setGateOpen(false)
    setDraft('')
    await thread.sendMessage({ text: value })
  }

  function startNewChat() {
    if (busy) return
    rememberPending(null)
    thread.reset()
    thread.clearError()
    setHeld(null)
    setGateOpen(false)
    setDraft('')
    setFocusToken((value) => value + 1)
  }
  function selectPrompt(message: string) {
    setDraft(message)
    setFocusToken((value) => value + 1)
  }
  const assistantTurns = thread.messages.filter((message) => message.role === 'assistant').length

  useEffect(() => {
    if (session.status !== 'user' || assistantTurns === 0) return
    let cancelled = false

    async function check() {
      try {
        const data = await api<MemoryList>('/api/memory')
        if (cancelled) return
        const ids = new Set(data.memories.map((memory) => memory.id))
        const known = knownMemoryIds.current
        knownMemoryIds.current = ids
        // The first look of a visit only records what was already there.
        if (!known) return
        const fresh = data.memories.filter((memory) => !known.has(memory.id))
        if (fresh.length === 0) return
        setSaved((current) => ({
          ...current,
          [assistantTurns - 1]: {
            count: fresh.length,
            blobUrl: fresh.find((memory) => memory.blobUrl)?.blobUrl ?? null,
          },
        }))
      } catch { /* The usual panel already reports memory trouble. */ }
    }

    // A fact is written just after the reply, and Walrus confirms the blob a
    // little later, so this looks more than once.
    const timers = [3000, 12000, 25000].map((delay) => setTimeout(() => { void check() }, delay))
    return () => {
      cancelled = true
      for (const timer of timers) clearTimeout(timer)
    }
  }, [assistantTurns, session.status])

  function handleScroll() {
    const el = scrollRef.current
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90
  }
  const rows: React.ReactNode[] = []
  let assistantIndex = -1
  for (const message of thread.messages) {
    const isAssistant = message.role === 'assistant'
    if (isAssistant) assistantIndex += 1
    const isLast = message.id === thread.messages[thread.messages.length - 1]?.id
    rows.push(<MessageBubble key={message.id} message={message}
      recall={isAssistant ? thread.recallNotes[assistantIndex]?.count : undefined}
      saved={isAssistant ? saved[assistantIndex] : undefined}
      streaming={isAssistant && isLast && busy} />)
  }
  const empty = thread.messages.length === 0 && !held && !gateOpen

  return (
    <AppShell fill sidebar={<YourUsualPanel refreshToken={refreshToken} conversationId={thread.conversationId} />}>
      <header className='chat-header'>
        <span className='grid size-8 place-items-center rounded-full bg-lavender-tint'><Sparkles className='size-4' strokeWidth={1.6} /></span>
        <div>
          <p className='chat-header-title'>Chat with Reggie</p>
          <p className='chat-header-subtitle'>A familiar face at Regency Stores</p>
        </div>
        <span className='ml-auto hidden items-center gap-1.5 pr-3 text-[11px] text-ink-muted xl:flex'><MapPin className='size-3.5' /> {STORE_LOCATION}</span>
        <div className='ml-auto flex items-center gap-2 xl:ml-0'>
          <button type='button' onClick={() => setSheetOpen(true)} aria-label='Open your usual'
            className={cx(buttonStyles('secondary', 'sm'), 'lg:hidden')}>
            <ShoppingBasket className='size-4' /><span className='hidden sm:inline'>Your usual</span>
          </button>
          <button type='button' onClick={startNewChat} disabled={busy} aria-label='Start a new chat'
            className={buttonStyles('secondary', 'sm', 'gap-1.5')}>
            <Plus className='size-4' strokeWidth={1.7} /><span className='hidden sm:inline'>New chat</span>
          </button>
        </div>
      </header>

      {thread.memoryStatus === 'degraded' ? <div role='status' className='mx-6 rounded-field bg-warn-tint px-4 py-2'><MemoryDegradedLine /></div> : null}

      <main id='main-content' ref={scrollRef} onScroll={handleScroll}
        className={cx('chat-scroll scroll-slim', empty && 'chat-empty-scroll')}>
        {empty ? <EmptyThread onPrompt={selectPrompt} /> : (
          <div className='chat-messages'>
            <DayDivider label='This conversation' />
            {rows}
            {thread.status === 'submitted' ? <div role='status' className='flex items-center gap-3 text-xs text-ink-muted'><AssistantAvatar className='size-8' /><TypingDots /><span>Reggie is thinking</span></div> : null}
            {held ? <HeldMessage text={held} /> : null}
            {gateOpen ? <AuthGate /> : null}
            {thread.error ? (
              <div role='alert' className='flex gap-3'>
                <AssistantAvatar className='size-8' />
                <div className='max-w-[85%] rounded-bubble border border-danger/20 bg-danger/10 p-4 text-sm leading-relaxed text-danger'>
                  <p>That reply did not come through. Your message is still here.</p>
                  <button type='button' onClick={() => { thread.clearError(); void thread.regenerate() }} className='mt-2 font-medium underline underline-offset-4'>Try again</button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>

      <div className='chat-composer-area'>
        <Composer value={draft} onChange={setDraft} onSubmit={handleSubmit}
          onStop={() => thread.stop()} busy={busy} autoFocusToken={focusToken} />
      </div>

      <Modal open={sheetOpen} onClose={() => setSheetOpen(false)} title='Your usual' sheet>
        {sheetOpen ? <YourUsualPanel refreshToken={refreshToken} conversationId={thread.conversationId} /> : null}
      </Modal>
    </AppShell>
  )
}

function EmptyThread({ onPrompt }: { onPrompt: (message: string) => void }) {
  return (
    <div className='welcome'>
      <div className='welcome-kicker'>
        <AssistantAvatar className='size-11' />
        <div><span>Your neighbourhood shopping assistant</span><p>A little help, from your local store.</p></div>
      </div>
      <h1>Hi, I’m Reggie.<br /><span>What’s on your list?</span></h1>
      <p className='welcome-copy'>Fresh groceries, familiar favourites, and a shop that remembers you. Tell me what you need.</p>
      <div className='prompt-heading'><Sparkles className='size-3.5' strokeWidth={1.6} /> A few ways to get started</div>
      <div className='prompt-grid'>
        {PROMPTS.map(({ title, hint, text, Icon }) => (
          <button key={title} type='button' className='prompt-card' onClick={() => onPrompt(text)}>
            <span className='prompt-card-icon'><Icon className='size-5' strokeWidth={1.55} /></span>
            <ArrowUpRight className='prompt-arrow size-3.5' strokeWidth={1.6} />
            <span className='prompt-title'>{title}</span>
            <span className='prompt-subtitle'>{hint}</span>
          </button>
        ))}
      </div>
      <p className='mt-5 flex items-center gap-1.5 text-[11px] text-ink-muted'><Clock3 className='size-3.5' strokeWidth={1.6} /> Here for the big shop and the little things.</p>
    </div>
  )
}