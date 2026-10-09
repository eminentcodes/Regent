import { CalendarDays, Star, TriangleAlert, User } from 'lucide-react'
import type { MemoryTag } from './types'

export type ChipTone = 'neutral' | 'leaf' | 'clay' | 'warn' | 'live'

export const TAG_ORDER: MemoryTag[] = ['profile', 'pref', 'event', 'issue']

export const TAG_META: Record<
  MemoryTag,
  { label: string; blurb: string; Icon: typeof User; tone: ChipTone }
> = {
  profile: {
    label: 'About you',
    blurb: 'Who you are and where you live',
    Icon: User,
    tone: 'neutral',
  },
  pref: {
    label: 'Your usual',
    blurb: 'What you buy and how you like it',
    Icon: Star,
    tone: 'leaf',
  },
  event: {
    label: 'Past orders',
    blurb: 'Things you asked for before',
    Icon: CalendarDays,
    tone: 'neutral',
  },
  issue: {
    label: 'Things to fix',
    blurb: 'Complaints and problems',
    Icon: TriangleAlert,
    tone: 'warn',
  },
}
