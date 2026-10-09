import type { Metadata } from 'next'
import { StoreHome } from '@/app/_components/store/store-home'

export const metadata: Metadata = {
  title: 'Regency Stores | Groceries in Lagos',
  description:
    'Browse fresh produce, pantry favourites and everyday essentials at Regency Stores in Lagos. Build your list and chat with Reggie.',
}

export default function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>
}) {
  return <StoreHome searchParams={searchParams} />
}