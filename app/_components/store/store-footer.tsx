import Link from 'next/link'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { chatHref, STORE_LOCATION } from '@/app/_lib/store'
import { REGENT_URL } from '@/config/sites'
import { StoreBrand } from './store-brand'

export function StoreFooter() {
  return <footer className='site-footer'>
    <div className='site-container'>
      <div className='site-footer-main'>
        <div className='site-footer-brand'>
          <Link href='/' aria-label='Regency Stores home'><StoreBrand /></Link>
          <p>Good groceries for your everyday.<br />From our shelves to your kitchen.</p>
        </div>
        <nav aria-label='Explore the store'><h2>From your local</h2><a href='#catalogue'>Browse groceries</a><a href='#delivery'>Delivery & pickup</a></nav>
        <nav aria-label='Shopping with Reggie'><h2>A little help from Reggie</h2><a href={chatHref()}>Chat with Reggie <ArrowUpRight className='inline size-3.5' aria-hidden='true' /></a><a href={REGENT_URL + '/memory'}>Your memory <ArrowUpRight className='inline size-3.5' aria-hidden='true' /></a><a href={REGENT_URL + '/#how-it-works'}>How Reggie remembers</a></nav>
        <div className='site-footer-location'><h2>Come say hello</h2><p><MapPin className='size-4' aria-hidden='true' />{STORE_LOCATION}</p><p>Mon to Sat, 7am to 8pm<br />Sunday, 10am to 5pm</p></div>
      </div>
      <div className='site-footer-bottom'><span>© {new Date().getFullYear()} Regency Stores</span><span>Fresh groceries. Familiar favourites.</span></div>
    </div>
  </footer>
}
