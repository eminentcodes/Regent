import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}

/* ---------------------------------------------------------------- spinner */

export function Spinner({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' className={'animate-spin ' + className} aria-hidden='true'>
      <circle cx='12' cy='12' r='9' fill='none' stroke='currentColor' strokeOpacity='0.25' strokeWidth='3' />
      <path
        d='M21 12a9 9 0 0 0-9-9'
        fill='none'
        stroke='currentColor'
        strokeWidth='3'
        strokeLinecap='round'
      />
    </svg>
  )
}

/* ----------------------------------------------------------------- button */

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-leaf text-on-leaf hover:bg-leaf-hover shadow-[0_1px_2px_rgb(12_13_15/0.12)]',
  secondary: 'bg-paper text-ink border border-line hover:border-line-strong hover:bg-canvas-soft',
  quiet: 'text-ink-muted hover:bg-canvas-soft hover:text-ink',
  danger: 'text-danger hover:bg-danger/10',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[0.82rem] gap-1.5',
  md: 'h-11 px-5 text-[0.88rem] gap-2',
  lg: 'h-12 px-6 text-[0.95rem] gap-2',
}

export function buttonStyles(variant: Variant = 'primary', size: Size = 'md', className = ''): string {
  return cx(
    'inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-medium',
    'transition-[background-color,border-color,color,box-shadow,transform] duration-150',
    'active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: {
  variant?: Variant
  size?: Size
  loading?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={buttonStyles(variant, size, className)}
    >
      {loading ? <Spinner className='size-4' /> : null}
      {children}
    </button>
  )
}

export function IconButton({
  label,
  className,
  children,
  ...rest
}: { label: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={cx(
        'grid size-9 place-items-center rounded-full text-ink-muted transition-colors',
        'hover:bg-canvas-soft hover:text-ink disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ input */

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string
  hint?: string
  error?: string | null
  htmlFor: string
  children: ReactNode
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <label htmlFor={htmlFor} className='text-[0.8rem] font-medium text-ink-muted'>
        {label}
      </label>
      {children}
      {error ? (
        <p className='text-[0.78rem] font-medium text-danger' role='alert'>
          {error}
        </p>
      ) : hint ? (
        <p className='text-[0.78rem] text-ink-faint'>{hint}</p>
      ) : null}
    </div>
  )
}

const FIELD_BASE =
  'w-full rounded-field border border-line bg-paper px-3.5 text-[0.92rem] text-ink ' +
  'placeholder:text-ink-faint transition-colors hover:border-line-strong ' +
  'focus:border-leaf focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf ' +
  'disabled:opacity-60'

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cx(FIELD_BASE, 'h-11', className)} />
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cx(FIELD_BASE, 'py-3 leading-relaxed', className)} />
}

/* ------------------------------------------------------------------- card */

export function Card({
  className,
  tinted = false,
  children,
}: {
  className?: string
  tinted?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cx(
        'rounded-card border border-line shadow-card',
        tinted ? 'tint-surface' : 'bg-paper',
        className,
      )}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------- chip */

export function Chip({
  children,
  className,
  tone = 'neutral',
}: {
  children: ReactNode
  className?: string
  tone?: 'neutral' | 'leaf' | 'clay' | 'warn' | 'live'
}) {
  const tones = {
    neutral: 'bg-canvas-soft text-ink-muted ring-line',
    leaf: 'bg-leaf-tint text-leaf ring-leaf/25',
    clay: 'bg-clay-tint text-clay ring-clay/25',
    warn: 'bg-warn-tint text-warn ring-warn/25',
    live: 'bg-live/10 text-live ring-live/25',
  } as const

  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-medium ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ alert */

export function Alert({
  tone = 'neutral',
  icon,
  children,
  className,
}: {
  tone?: 'neutral' | 'warn' | 'danger'
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  const tones = {
    neutral: 'bg-lavender-tint text-ink-muted border-line',
    warn: 'bg-warn-tint text-warn border-warn/25',
    danger: 'bg-danger/10 text-danger border-danger/25',
  } as const

  return (
    <div
      className={cx(
        'flex items-start gap-2.5 rounded-field border px-3.5 py-2.5 text-[0.82rem] leading-snug',
        tones[tone],
        className,
      )}
      role={tone === 'neutral' ? undefined : 'status'}
    >
      {icon ? <span className='mt-px shrink-0'>{icon}</span> : null}
      <div className='min-w-0'>{children}</div>
    </div>
  )
}

/* ------------------------------------------------------------ empty state */

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  body: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cx('flex flex-col items-start gap-3 px-1 py-6', className)}>
      {icon ? (
        <span className='grid size-11 place-items-center rounded-field bg-canvas-soft text-ink-faint'>
          {icon}
        </span>
      ) : null}
      <div className='flex flex-col gap-1'>
        <p className='text-[0.95rem] font-semibold text-ink'>{title}</p>
        <p className='max-w-[46ch] text-[0.85rem] leading-relaxed text-ink-muted'>{body}</p>
      </div>
      {action}
    </div>
  )
}

/* --------------------------------------------------------------- skeleton */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-field bg-canvas-soft', className)} />
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className='flex flex-wrap items-end justify-between gap-4'>
      <div className='flex flex-col gap-1.5'>
        <h1 className='text-2xl font-semibold tracking-tight text-ink md:text-[1.75rem]'>{title}</h1>
        {description ? (
          <p className='max-w-[62ch] text-[0.9rem] leading-relaxed text-ink-muted'>{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
