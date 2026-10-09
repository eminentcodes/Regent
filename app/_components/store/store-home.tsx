import { getStoreCatalogue } from '@/app/_lib/catalogue'
import { Storefront } from './storefront'

export async function StoreHome({ searchParams }: {
  searchParams: Promise<{ category?: string | string[] }>
}) {
  const [catalogue, params] = await Promise.all([getStoreCatalogue(), searchParams])
  const category = typeof params.category === 'string' && catalogue.categories.some(({ id }) => id === params.category)
    ? params.category : 'all'
  return <Storefront key={category} {...catalogue} initialCategory={category} />
}
