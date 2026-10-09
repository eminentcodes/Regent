'use client'

import type { UIMessage } from 'ai'
import { motion, useReducedMotion } from 'motion/react'
import { AssistantAvatar } from '../brand'
import { RecallChip, StreamCaret, TypingDots } from './recall-chip'
import { cx } from '../ui/primitives'

export function messageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => (part as { type: 'text'; text: string }).text)
    .join('')
}

export function MessageBubble({
  message,
  recall,
  streaming = false,
}: {
  message: UIMessage
  recall?: number
  streaming?: boolean
}) {
  const reduceMotion = useReducedMotion()
  const text = messageText(message)
  const isUser = message.role === 'user'

  const enter = reduceMotion
    ? false
    : { opacity: 0, y: 10 }
  const settled = { opacity: 1, y: 0 }
  const transition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }

  if (isUser) {
    return (
      <motion.div
        initial={enter}
        animate={settled}
        transition={transition}
        className='flex justify-end'
      >
        <div className='max-w-[86%] rounded-bubble rounded-br-[6px] bg-lavender-tint px-5 py-3 text-[0.92rem] leading-relaxed whitespace-pre-wrap text-ink md:max-w-[78%]'>
          {text}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={enter} animate={settled} transition={transition} className='flex gap-3'>
      <AssistantAvatar className='mt-0.5 size-8' />
      <div className='min-w-0 max-w-[88%] md:max-w-[76%]'>
        <div className='rounded-bubble rounded-bl-[6px] bg-paper px-5 py-4 text-[0.92rem] leading-relaxed text-ink'>
          {text ? (
            <span className='whitespace-pre-wrap'>
              {text}
              {streaming ? <StreamCaret /> : null}
            </span>
          ) : streaming ? (
            <TypingDots />
          ) : null}
        </div>
        <RecallChip count={recall ?? 0} />
      </div>
    </motion.div>
  )
}

export function DayDivider({ label }: { label: string }) {
  return (
    <div className={cx('flex items-center gap-3 py-1')}>
      <span className='h-px flex-1 bg-line' />
      <span className='text-[0.7rem] font-medium tracking-wide text-ink-faint'>{label}</span>
      <span className='h-px flex-1 bg-line' />
    </div>
  )
}
