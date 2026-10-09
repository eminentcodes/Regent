import Link from 'next/link'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { RegentLogo } from '../brand'
import { STORE_LOCATION } from '@/app/_lib/store'
import { WALRUS_MEMORY_URL } from '@/config/sites'

export function SiteFooter() {
  return (
    <footer className='site-footer'>
      <div className='site-container'>
        <div className='site-footer-main'>
          <div className='site-footer-brand'>
            <Link href='/' aria-label='Regent home'><RegentLogo subtitle='by Regency Stores' /></Link>
            <p>A little help with your everyday.<br />A longer memory, with Walrus Memory.</p>
          </div>
          <nav aria-label='Explore'><h2>Make yourself at home</h2><Link href='/chat'>Chat with Reggie</Link><Link href='/memory'>Your memory</Link><Link href='/#how-it-works'>How it works</Link></nav>
          <nav aria-label='About memory'><h2>The useful things</h2><Link href='/#walrus-memory'>Walrus Memory in action</Link><Link href='/#questions'>Common questions</Link><Link href='/shared'>Shared learnings</Link></nav>
          <div className='site-footer-location'><h2>Regency Stores</h2><p><MapPin className='size-4' aria-hidden='true' />{STORE_LOCATION}</p><p>Mon to Sat, 7am to 8pm<br />Sunday, 10am to 5pm</p></div>
        </div>
        <div className='site-footer-bottom'><span>© {new Date().getFullYear()} Regency Stores</span><a href={WALRUS_MEMORY_URL} target='_blank' rel='noopener noreferrer' className='footer-memory-link'>Powered by Walrus Memory <ArrowUpRight className='size-3.5' aria-hidden='true' /><span className='sr-only'> (opens in a new tab)</span></a></div>
      </div>
    </footer>
  )
}
