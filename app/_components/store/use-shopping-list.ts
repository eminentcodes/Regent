'use client'

import { useSyncExternalStore } from 'react'
import type { StoreProduct } from '@/app/_lib/store'

const KEY = 'regent:shopping-list:v1'
const EVENT = 'regent-shopping-list'
let fallback = '{}'
let storageFailed = false

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === KEY || event.key === null) callback() }
  window.addEventListener('storage', onStorage)
  window.addEventListener(EVENT, callback)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(EVENT, callback)
  }
}

function snapshot(): string {
  if (storageFailed) return fallback
  try { return localStorage.getItem(KEY) ?? '{}' } catch { return fallback }
}

function readList(value: string, products: StoreProduct[]): Record<string, number> {
  try {
    const raw = JSON.parse(value)
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
    return Object.fromEntries(products.flatMap(({ id }) => {
      const quantity = raw[id]
      return Number.isInteger(quantity) && quantity > 0 ? [[id, Math.min(quantity, 99)]] : []
    }))
  } catch { return {} }
}

export function useShoppingList(products: StoreProduct[]) {
  const saved = useSyncExternalStore(subscribe, snapshot, () => '{}')
  const quantities = readList(saved, products)
  const items = products.filter(({ id }) => quantities[id]).map((product) => ({ product, quantity: quantities[product.id] }))
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0)

  function save(next: Record<string, number>) {
    fallback = JSON.stringify(next)
    let persistent = true
    try {
      localStorage.setItem(KEY, fallback)
      storageFailed = false
    } catch {
      persistent = false
      storageFailed = true
    }
    window.dispatchEvent(new Event(EVENT))
    return persistent
  }

  function changeQuantity(id: string, delta: number) {
    if (!products.some((product) => product.id === id)) return true
    const next = readList(snapshot(), products)
    const quantity = Math.max(0, Math.min(99, (next[id] ?? 0) + delta))
    if (quantity) next[id] = quantity
    else delete next[id]
    return save(next)
  }

  function remove(id: string) {
    const next = readList(snapshot(), products)
    delete next[id]
    return save(next)
  }

  return { quantities, items, count, total, changeQuantity, remove, clear: () => save({}) }
}
