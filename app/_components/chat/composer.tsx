'use client'

import { useEffect, useRef } from 'react'
import { ArrowUp, CornerDownLeft, ShieldCheck, Sparkles, Square } from 'lucide-react'

export function Composer({ value, onChange, onSubmit, onStop, busy = false, disabled = false, autoFocusToken = 0 }: {
  value: string; onChange: (next: string) => void; onSubmit: (message: string) => void;
  onStop?: () => void; busy?: boolean; disabled?: boolean; autoFocusToken?: number
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 168) + 'px'
  }, [value])
  useEffect(() => { if (autoFocusToken > 0) ref.current?.focus() }, [autoFocusToken])
  function submit() {
    const message = value.trim()
    if (!message || busy || disabled) return
    onSubmit(message)
  }
  return (
    <form onSubmit={(event) => { event.preventDefault(); submit() }}>
      <div className='composer-box'>
        <label htmlFor='regent-composer' className='sr-only'>Message Reggie</label>
        <textarea id='regent-composer' ref={ref} rows={1} value={value} disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault()
              submit()
            }
          }}
          placeholder='A few tomatoes? Your weekly shop? Just ask…' />
        <div className='composer-tools'>
          <span className='composer-tools-label'><Sparkles className='size-3' strokeWidth={1.7} /> Ask Reggie</span>
          {busy && onStop ? (
            <button type='button' onClick={onStop} aria-label='Stop the reply' title='Stop the reply'
              className='grid size-9 place-items-center rounded-full bg-ink text-paper transition-transform active:scale-95'>
              <Square className='size-3 fill-current' />
            </button>
          ) : (
            <button type='submit' disabled={!value.trim() || disabled || busy} aria-label='Send message' title='Send message'
              className='grid size-9 place-items-center rounded-full bg-leaf text-on-leaf transition-[background-color,transform,opacity] hover:bg-leaf-hover active:scale-95 disabled:opacity-40'>
              <ArrowUp className='size-5' strokeWidth={1.8} />
            </button>
          )}
        </div>
      </div>
      <div className='composer-note'>
        <span><ShieldCheck className='size-3' strokeWidth={1.6} /> Your preferences stay yours.</span>
        <span className='composer-keyboard'><CornerDownLeft className='size-3' /> Enter to send <span className='mx-1'>·</span> Shift + Enter for a new line</span>
      </div>
    </form>
  )
}

