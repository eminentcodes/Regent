import type { ReactNode } from 'react'

/** The Regent glyph: a geometric R drawn on a 24px grid. */
export function RegentGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' fill='none' aria-hidden='true' className={className}>
      <g
        stroke='currentColor'
        strokeWidth={3.4}
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M7.6 18.2V5.8' />
        <path d='M7.6 5.8h4.8a4.3 4.3 0 0 1 0 8.6H7.6' />
        <path d='M12.9 14.5 17 18.2' />
      </g>
    </svg>
  )
}

export function RegentMark({ className = 'size-9' }: { className?: string }) {
  return (
    <span
      aria-hidden='true'
      className={
        'mark-tile grid shrink-0 place-items-center rounded-[30%] text-sage shadow-[inset_0_1px_0_rgb(255_255_255/0.18)] ' +
        className
      }
    >
      <RegentGlyph className='h-[64%] w-[64%]' />
    </span>
  )
}

export function RegentLogo({
  subtitle,
  className = '',
}: {
  subtitle?: string
  className?: string
}) {
  return (
    <span className={'flex items-center gap-2.5 ' + className}>
      <RegentMark className='size-9' />
      <span className='flex min-w-0 flex-col leading-none'>
        <span className='text-[1.05rem] font-semibold tracking-tight text-ink'>Regent</span>
        {subtitle ? (
          <span className='mt-1 truncate text-[0.7rem] font-medium tracking-wide text-ink-faint'>
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  )
}

export function AssistantAvatar({ className = 'size-8' }: { className?: string }) {
  return (
    <span
      aria-hidden='true'
      className={
        'grid shrink-0 place-items-center rounded-full bg-clay-tint text-clay ring-1 ring-clay/20 ' +
        className
      }
    >
      <RegentGlyph className='h-[62%] w-[62%]' />
    </span>
  )
}

export function UserAvatar({ label, className = 'size-8' }: { label: string; className?: string }) {
  const initial = (label.trim()[0] ?? '?').toUpperCase()
  return (
    <span
      aria-hidden='true'
      className={
        'grid shrink-0 place-items-center rounded-full bg-lavender-tint text-[0.72rem] font-semibold text-ink-muted ring-1 ring-line ' +
        className
      }
    >
      {initial}
    </span>
  )
}

export function WordmarkRow({ children }: { children?: ReactNode }) {
  return <div className='flex items-center gap-3'>{children}</div>
}
