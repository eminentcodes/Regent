'use client'

import { motion, useReducedMotion } from 'motion/react'
import { Sparkles, TriangleAlert } from 'lucide-react'

/** The quiet recall indicator. Count comes from the X-Recall-Count header. */
export function RecallChip({ count }: { count: number }) {
  const reduceMotion = useReducedMotion()
  if (count <= 0) return null

  return (
    <motion.p
      initial={reduceMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className='mt-2 inline-flex items-center gap-1.5 text-[0.74rem] font-medium text-ink-faint'
    >
      <Sparkles className='size-3.5 text-leaf' strokeWidth={1.9} />
      <span>
        recalled {count} {count === 1 ? 'detail' : 'details'} from your memory
      </span>
    </motion.p>
  )
}

/** Degraded memory is a normal state, never an error screen. */
export function MemoryDegradedLine() {
  return (
    <p className='inline-flex items-center gap-1.5 text-[0.76rem] font-medium text-warn'>
      <TriangleAlert className='size-3.5' strokeWidth={1.9} />
      <span>memory is offline right now, replies still work</span>
    </p>
  )
}

export function TypingDots() {
  return (
    <span className='inline-flex items-center gap-1 py-1' aria-label='Reggie is typing'>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className='regent-stream-dot size-1.5 rounded-full bg-ink-faint'
          style={{ animationDelay: index * 0.18 + 's' }}
        />
      ))}
    </span>
  )
}

export function StreamCaret() {
  const reduceMotion = useReducedMotion()
  return (
    <motion.span
      aria-hidden='true'
      className='ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.16em] rounded-full bg-leaf'
      animate={reduceMotion ? { opacity: 1 } : { opacity: [1, 0.15, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}
