'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Clock3, MapPin, MessageCircle, Minus, Plus, Search, ShoppingBag, ShoppingBasket, Trash2, Truck, X } from 'lucide-react'
import { type StoreCategory, type StoreProduct, chatHref, formatNaira, STORE_LOCATION } from '@/app/_lib/store'
import { StoreHeader } from './store-header'
import { StoreFooter } from './store-footer'
import { AssistantAvatar } from '../brand'
import { Modal } from '../ui/modal'
import { buttonStyles, cx } from '../ui/primitives'
import { useShoppingList } from './use-shopping-list'

const PAGE_SIZE = 12
type Sort = 'featured' | 'price-low' | 'price-high' | 'name'

function QuantityControl({ product, quantity, onChange }: {
  product: StoreProduct; quantity: number; onChange: (delta: number) => void
}) {
  return <div className='quantity-control' aria-label={'Quantity of ' + product.name}>
    <button type='button' onClick={() => onChange(-1)} aria-label={'Remove one ' + product.name}><Minus className='size-3.5' aria-hidden='true' /></button>
    <span aria-label={quantity + ' in your list'}>{quantity}</span>
    <button type='button' onClick={() => onChange(1)} disabled={quantity >= 99} aria-label={'Add one ' + product.name}><Plus className='size-3.5' aria-hidden='true' /></button>
  </div>
}

export function Storefront({ products, categories, initialCategory = 'all' }: {
  products: StoreProduct[]; categories: StoreCategory[]; initialCategory?: string
}) {
  const [category, setCategory] = useState(initialCategory)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('featured')
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [listOpen, setListOpen] = useState(false)
  const [selected, setSelected] = useState<StoreProduct | null>(null)
  const [notice, setNotice] = useState('')
  const [storageUnavailable, setStorageUnavailable] = useState(false)
  const list = useShoppingList(products)

  useEffect(() => {
    if (!notice) return
    const timeout = setTimeout(() => setNotice(''), 3200)
    return () => clearTimeout(timeout)
  }, [notice])

  const search = query.trim().toLowerCase()
  const filtered = products.filter((product) =>
    (category === 'all' || product.category === category) &&
    (!search || (product.name + ' ' + categories.find(({ id }) => id === product.category)?.label).toLowerCase().includes(search)),
  ).sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price
    if (sort === 'price-high') return b.price - a.price
    if (sort === 'name') return a.name.localeCompare(b.name)
    return 0
  })
  const visible = filtered.slice(0, limit)
  const currentCategory = categories.find(({ id }) => id === category)?.label ?? 'All groceries'

  function selectCategory(id: string) {
    setCategory(id)
    setLimit(PAGE_SIZE)
    const url = new URL(window.location.href)
    if (id === 'all') url.searchParams.delete('category')
    else url.searchParams.set('category', id)
    window.history.replaceState(null, '', url.pathname + url.search + url.hash)
  }

  function changeQuantity(product: StoreProduct, delta: number) {
    const saved = list.changeQuantity(product.id, delta)
    setStorageUnavailable(!saved)
    if (delta > 0 && !list.quantities[product.id]) setNotice(product.title + ' added to your list.')
  }

  const listMessage = 'Hi Reggie, I’d like help with this shopping list:\n\n' +
    list.items.map(({ product, quantity }) => quantity + ' x ' + product.name).join('\n') +
    '\n\nPlease confirm availability, delivery options, and the final total.'

  return (
    <div className='site-page store-page'>
      <a href='#main-content' className='skip-link'>Skip to content</a>
      <StoreHeader action={<button type='button' className={buttonStyles('primary', 'md', 'shopping-list-trigger')} onClick={() => setListOpen(true)} aria-label={'Open shopping list, ' + list.count + ' items'}>
        <ShoppingBag className='size-4' aria-hidden='true' /><span>Your list</span><span className='list-count'>{list.count}</span>
      </button>} />

      <main id='main-content'>
        <section className='site-container store-hero' aria-labelledby='store-page-title'>
          <div className='store-hero-copy'>
            <p className='store-location'><MapPin className='size-3.5' aria-hidden='true' />Regency Stores, {STORE_LOCATION}</p>
            <h1 id='store-page-title'>Your everyday,<br /><span>freshly sorted.</span></h1>
            <p>Fresh produce, familiar favourites, and the little things that make a house feel like home.</p>
            <a href='#catalogue' className={buttonStyles('primary', 'lg')}>Explore the shelves <ArrowDown className='size-4' aria-hidden='true' /></a>
          </div>
          <div className='store-hero-photo'><Image src='/images/market-produce.jpg' alt='Fresh vegetables and pantry ingredients at a grocery market' fill sizes='(max-width: 767px) 92vw, 600px' preload /></div>
        </section>

        <div className='site-container store-benefits'>
          <span><Truck className='size-4' aria-hidden='true' />Free delivery on orders above ₦50,000</span>
          <span><Clock3 className='size-4' aria-hidden='true' />Same day when you order before 3pm</span>
          <span><ShoppingBag className='size-4' aria-hidden='true' />Free store pickup</span>
        </div>

        <section id='catalogue' className='site-container store-catalogue' aria-labelledby='catalogue-title'>
          <div className='catalogue-heading'>
            <div><h2 id='catalogue-title'>What’s on your list?</h2><p>Pick your favourites. Reggie will help with the rest.</p></div>
            <div className='store-search'><Search className='size-4' aria-hidden='true' /><label htmlFor='store-search' className='sr-only'>Search groceries</label>
              <input id='store-search' type='search' value={query} placeholder='Try rice, eggs, or your favourite brand' onChange={(event) => { setQuery(event.target.value); setLimit(PAGE_SIZE) }} />
              {query ? <button type='button' onClick={() => { setQuery(''); setLimit(PAGE_SIZE) }} aria-label='Clear search'><X className='size-4' /></button> : null}
            </div>
          </div>

          <div className='store-categories scroll-slim' role='group' aria-label='Grocery categories'>
            <button type='button' className={cx('category-filter', category === 'all' && 'is-active')} aria-pressed={category === 'all'} onClick={() => selectCategory('all')}>All groceries<span>{products.length}</span></button>
            {categories.map(({ id, label }) => <button type='button' key={id} aria-pressed={category === id} className={cx('category-filter', category === id && 'is-active')} onClick={() => selectCategory(id)}>{label}</button>)}
          </div>

          <div className='catalogue-toolbar'>
            <p role='status' aria-live='polite'><strong>{query ? 'Search results' : currentCategory}</strong><span>{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</span></p>
            <div className='store-sort'><label htmlFor='store-sort'>Sort by</label><select id='store-sort' value={sort} onChange={(event) => { setSort(event.target.value as Sort); setLimit(PAGE_SIZE) }}>
              <option value='featured'>Our picks</option><option value='price-low'>Price: low to high</option><option value='price-high'>Price: high to low</option><option value='name'>Name: A to Z</option>
            </select><ChevronDown className='size-3.5' aria-hidden='true' /></div>
          </div>

          {visible.length ? <div className='product-grid'>
            {visible.map((product) => <article className='product-card' key={product.id}>
              <button type='button' className='product-photo' aria-label={'View ' + product.name} onClick={() => setSelected(product)}>
                <Image src={product.image} alt={product.imageAlt} fill sizes='(max-width: 479px) 44vw, (max-width: 767px) 45vw, (max-width: 1023px) 30vw, 300px' />
              </button>
              <div className='product-info'><p className='product-category'>{categories.find(({ id }) => id === product.category)?.label}</p><h3>{product.title}</h3><p className='product-size'>{product.size}</p>
                <div className='product-bottom'><strong>{formatNaira(product.price)}</strong>{list.quantities[product.id] ? <QuantityControl product={product} quantity={list.quantities[product.id]} onChange={(delta) => changeQuantity(product, delta)} /> :
                  <button type='button' className='product-add' aria-label={'Add ' + product.name + ' to your list'} onClick={() => changeQuantity(product, 1)}><Plus className='size-4' aria-hidden='true' /></button>}
                </div>
              </div>
            </article>)}
          </div> : <div className='store-empty'>
            <Search className='size-8' strokeWidth={1.4} aria-hidden='true' /><h3>No groceries found this time.</h3><p>{category !== 'all' ? 'Try another category or a different search.' : 'Try a shorter name, like rice or milk.'}</p>
            <button type='button' className={buttonStyles('secondary', 'md')} onClick={() => { setQuery(''); selectCategory('all'); setSort('featured') }}>Show all groceries</button>
            <a href={chatHref('Do you stock ' + (query.trim() || 'other groceries') + '?')} className='site-text-link'>Ask Reggie <ArrowUpRight className='size-4' aria-hidden='true' /></a>
          </div>}

          {filtered.length > limit ? <div className='store-show-more'><p>Showing {visible.length} of {filtered.length} items</p><button type='button' className={buttonStyles('secondary', 'md')} onClick={() => setLimit((value) => value + PAGE_SIZE)}>Explore more <Plus className='size-4' aria-hidden='true' /></button></div> : null}
          <p className='catalogue-note'>Catalogue prices shown. Availability is confirmed with Reggie. Photos are illustrative.</p>
        </section>

        <section className='site-container reggie-store-callout' aria-labelledby='store-help-title'>
          <AssistantAvatar className='size-12' /><div><h2 id='store-help-title'>Not sure where to start?</h2><p>A recipe idea, a favourite brand, your usual order. Reggie is here to help.</p></div><a href={chatHref()} className={buttonStyles('primary', 'md')}>Chat with Reggie <ArrowUpRight className='size-4' aria-hidden='true' /></a>
        </section>

        <section id='delivery' className='site-container store-delivery-section' aria-label='Delivery and store information'>
          <div className='delivery-card'><Truck className='size-7' strokeWidth={1.4} aria-hidden='true' /><h2>A little closer to your door.</h2><p>Delivery across our Lagos service areas, from ₦1,500. Order before 3pm for same-day delivery.</p><p className='delivery-highlight'>Free delivery on orders above ₦50,000.</p><a href={chatHref('Do you deliver to my area, and what is the delivery fee?')} className='site-text-link'>Check your delivery area <ArrowUpRight className='size-4' aria-hidden='true' /></a></div>
          <div className='visit-card'><MapPin className='size-7' strokeWidth={1.4} aria-hidden='true' /><h2>Or make it a store visit.</h2><p>Regency Stores, {STORE_LOCATION}.<br />Pickup is always free.</p><dl><div><dt>Monday to Saturday</dt><dd>7am to 8pm</dd></div><div><dt>Sunday</dt><dd>10am to 5pm</dd></div></dl><a href={chatHref('I would like to collect an order. Please help me arrange store pickup and confirm the pickup address.')} className='site-text-link'>Arrange a pickup <ArrowUpRight className='size-4' aria-hidden='true' /></a></div>
        </section>
      </main>

      <StoreFooter />

      <div className={cx('store-toast', notice && 'is-visible')} role='status' aria-live='polite'>
        {notice ? <><Check className='size-4' aria-hidden='true' /><span>{notice}</span><button type='button' onClick={() => setListOpen(true)}>View list <ArrowRight className='size-3.5' /></button></> : null}
      </div>
      {list.count ? <button type='button' className='store-mobile-list' onClick={() => setListOpen(true)}><ShoppingBag className='size-4' aria-hidden='true' /><span>Your list <small>{list.count}</small></span><strong>{formatNaira(list.total)}</strong><ArrowRight className='size-4' aria-hidden='true' /></button> : null}

      <Modal open={listOpen} onClose={() => setListOpen(false)} title='Your shopping list' sheet>
        <div className='shopping-list-panel'>
          {list.items.length ? <>
            <div className='shopping-list-intro'><p>{list.items.length} {list.items.length === 1 ? 'favourite' : 'favourites'}, ready to chat about.</p><button type='button' onClick={() => { list.clear(); setNotice('Your shopping list is cleared.') }}>Clear list</button></div>
            <ul className='shopping-list-items'>{list.items.map(({ product, quantity }) => <li key={product.id}>
              <div className='list-item-photo'><Image src={product.image} alt={product.imageAlt} fill sizes='64px' /></div>
              <div className='list-item-info'><h3>{product.title}</h3><p>{product.size}</p><QuantityControl product={product} quantity={quantity} onChange={(delta) => changeQuantity(product, delta)} /></div>
              <div className='list-item-price'><strong>{formatNaira(product.price * quantity)}</strong><button type='button' aria-label={'Remove ' + product.name + ' from your list'} onClick={() => list.remove(product.id)}><Trash2 className='size-4' /></button></div>
            </li>)}</ul>
            <div className='shopping-list-total'><span>Estimated total</span><strong>{formatNaira(list.total)}</strong></div>
            <p className='shopping-list-note'>Reggie will confirm availability, delivery, and the final amount. Your list isn’t an order yet.</p>
            {storageUnavailable ? <p role='status' className='text-sm text-warn'>Your browser cannot save this list between visits. You can still send it to Reggie now.</p> : null}
            <a href={chatHref(listMessage)} className={buttonStyles('primary', 'lg', 'w-full')} onClick={() => setListOpen(false)}>Chat about this list <ArrowUpRight className='size-4' aria-hidden='true' /></a>
            <button type='button' className='shopping-list-continue' onClick={() => setListOpen(false)}>Keep browsing</button>
          </> : <div className='store-empty list-empty'><ShoppingBasket className='size-10' strokeWidth={1.3} aria-hidden='true' /><h3>A little room for your favourites.</h3><p>Add something from the shelves, then let Reggie help you put your shop together.</p><button type='button' className={buttonStyles('primary', 'md')} onClick={() => setListOpen(false)}>Explore the shelves <ArrowRight className='size-4' /></button></div>}
        </div>
      </Modal>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title='A closer look'>
        {selected ? <div className='product-detail'>
          <div className='product-detail-photo'><Image src={selected.image} alt={selected.imageAlt} fill sizes='440px' /></div>
          <div className='product-detail-copy'><p className='product-category'>{categories.find(({ id }) => id === selected.category)?.label}</p><h3>{selected.title}</h3><p>{selected.size}</p><strong className='product-detail-price'>{formatNaira(selected.price)}</strong><p className='shopping-list-note'>Catalogue price. Ask Reggie to confirm current availability. Photo is illustrative.</p>
            <button type='button' className={buttonStyles('primary', 'md', 'w-full')} disabled={(list.quantities[selected.id] ?? 0) >= 99} onClick={() => { changeQuantity(selected, 1); setSelected(null) }}><Plus className='size-4' aria-hidden='true' />{list.quantities[selected.id] ? 'Add another to your list' : 'Add to your list'}</button>
            <a href={chatHref('Hi Reggie, can you tell me about ' + selected.name + ' and confirm if it is available?')} className='site-text-link' onClick={() => setSelected(null)}><MessageCircle className='size-4' aria-hidden='true' />Ask about this item <ArrowUpRight className='size-4' aria-hidden='true' /></a>
          </div>
        </div> : null}
      </Modal>
    </div>
  )
}
