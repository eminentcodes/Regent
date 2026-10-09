'use client'

import { useState } from 'react'
import { Check, Database, Laptop, MessageCircle, Smartphone } from 'lucide-react'
import type { UIMessage } from 'ai'
import { MessageBubble } from '../chat/message-bubble'
import { AssistantAvatar } from '../brand'
import { cx } from '../ui/primitives'

const MEMORIES = ['Prefers Ofada rice', 'Chooses whole wheat bread']
const VISITS = [
  { label: 'First visit', device: 'A chat on your phone', Icon: Smartphone,
    user: 'I usually buy Ofada rice, and I prefer whole wheat bread.',
    reply: 'Ofada rice and whole wheat bread. Got it! What else is on your list?',
    note: 'Useful details are saved with your account for another day.' },
  { label: 'Next visit', device: 'A fresh conversation', Icon: MessageCircle,
    user: 'Can you help me with my usual?',
    reply: 'Of course. Ofada rice and whole wheat bread again? What would you like to add?',
    note: 'A new conversation. The same preferences, recalled from Walrus Memory.' },
  { label: 'New device', device: 'Signed in on your laptop', Icon: Laptop,
    user: 'New laptop. Do you still remember my favourites?',
    reply: 'Of course! Ofada rice and whole wheat bread. Shall we start your list with those?',
    note: 'The same account brings your saved preferences to another device.' },
]

/** Uses the actual chat bubbles. These examples never call the chat or memory API. */
export function ConversationPreview() {
  const [visit, setVisit] = useState(0)
  const current = VISITS[visit]
  const DeviceIcon = current.Icon
  const messages: UIMessage[] = [
    { id: visit + '-user', role: 'user', parts: [{ type: 'text', text: current.user }] },
    { id: visit + '-assistant', role: 'assistant', parts: [{ type: 'text', text: current.reply }] },
  ]
  return (
    <div id='walrus-memory' className='conversation-preview' role='region' aria-label='Walrus Memory example'>
      <div className='preview-heading'><AssistantAvatar className='size-10' /><div><strong>Reggie remembers with Walrus Memory</strong><span>Interactive example</span></div></div>
      <div className='preview-tabs' role='group' aria-label='Choose an example visit'>
        {VISITS.map(({ label }, index) => <button type='button' key={label} aria-pressed={visit === index}
          onClick={() => setVisit(index)} className={cx(visit === index && 'is-active')}>{label}</button>)}
      </div>
      <div aria-live='polite' aria-atomic='true'>
        <p className='preview-device'><DeviceIcon className='size-3.5' aria-hidden='true' />{current.device}</p>
        <div className='preview-messages'>
          {messages.map((message) => <MessageBubble key={message.id} message={message} recall={visit > 0 && message.role === 'assistant' ? MEMORIES.length : 0} />)}
        </div>
        <div className='preview-memory'>
          <p><Database className='size-4' aria-hidden='true' /><strong>{visit === 0 ? 'Saved to Walrus Memory' : 'Recalled from Walrus Memory'}</strong><span>{MEMORIES.length} details</span></p>
          <ul>{MEMORIES.map((memory) => <li key={memory}><Check className='size-3.5' aria-hidden='true' />{memory}</li>)}</ul>
        </div>
        <p className='preview-note'>{current.note}</p>
      </div>
    </div>
  )
}
