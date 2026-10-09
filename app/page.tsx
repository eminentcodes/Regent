import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Brain, ChevronDown, Database, Laptop, MessageCircle, ShieldCheck } from 'lucide-react'
import { SiteHeader } from './_components/site/site-header'
import { SiteFooter } from './_components/site/site-footer'
import { ConversationPreview } from './_components/site/conversation-preview'
import { buttonStyles } from './_components/ui/primitives'
import { StoreHome } from './_components/store/store-home'
import { WALRUS_MEMORY_URL } from '@/config/sites'

const QUESTIONS = [
  { question: 'How does Walrus Memory help?', answer: 'Reggie uses Walrus Memory to store useful details from your conversations and recall them when you return. A new chat can start with your preferences already in mind, even after you close the browser.' },
  { question: 'What does Reggie remember?', answer: 'Useful things you share, like your favourite groceries, dietary preferences, and delivery details. Open Your memory to review saved details and choose which ones Reggie can keep using.' },
  { question: 'Will it work on another device?', answer: 'Yes. Sign in to the same Regent account on your phone or computer. Reggie recalls your saved preferences from Walrus Memory, so they are not tied to one browser or an open conversation.' },
  { question: 'What happens when I forget a memory?', answer: 'Reggie stops using that record in future conversations. Forgetting does not erase the original record from Walrus storage; your account marks it as no longer used.' },
  { question: 'Can I browse before signing in?', answer: 'Yes. The Regency Stores website lets you browse groceries and build a shopping list without an account. Sign in when you send Reggie a message, so your saved preferences stay linked to you.' },
]

export default function HomePage({ searchParams }: { searchParams: Promise<{ category?: string | string[] }> }) {
  if (process.env.REGENT_SITE === 'store') return <StoreHome searchParams={searchParams} />

  return (
    <div className='site-page'>
      <a href='#main-content' className='skip-link'>Skip to content</a>
      <SiteHeader />
      <main id='main-content'>
        <section className='site-container landing-hero' aria-labelledby='hero-title'>
          <div className='landing-hero-copy'>
            <p className='site-eyebrow memory-eyebrow'><Database className='size-4' aria-hidden='true' />Powered by Walrus Memory</p>
            <h1 id='hero-title'>A chat that<span>remembers you.</span></h1>
            <p className='hero-description'>Meet Reggie, your grocery assistant. Your favourites stay with you across chats, visits, and devices.</p>
            <div className='hero-actions'>
              <Link href='/chat' className={buttonStyles('primary', 'lg')}>Chat with Reggie <ArrowUpRight className='size-4' aria-hidden='true' /></Link>
              <a href='#how-it-works' className='site-text-link'>See it in action <ArrowRight className='size-4' aria-hidden='true' /></a>
            </div>
          </div>
          <div className='landing-hero-visual'>
            <div className='hero-photo'><Image src='/images/market-produce.jpg' alt='A colourful selection of fresh vegetables at a grocery market' fill sizes='(max-width: 767px) 92vw, (max-width: 1100px) 46vw, 580px' preload /></div>
            <div className='hero-photo-inset'><Image src='/images/bread.jpg' alt='Freshly baked bread for the everyday shop' fill sizes='(max-width: 767px) 130px, 190px' /></div>
          </div>
        </section>

        <div className='site-container service-strip' aria-label='Memory that comes with you'>
          <div><Brain aria-hidden='true' /><span><strong>Your usual, remembered</strong><small>A little less explaining</small></span></div>
          <div><Database aria-hidden='true' /><span><strong>Saved with Walrus Memory</strong><small>Beyond a single conversation</small></span></div>
          <div><Laptop aria-hidden='true' /><span><strong>Any device. Same you.</strong><small>Just sign in to your account</small></span></div>
          <div><ShieldCheck aria-hidden='true' /><span><strong>You have a say</strong><small>Review what Reggie remembers</small></span></div>
        </div>

        <section id='how-it-works' className='site-container landing-how site-section' aria-labelledby='how-title'>
          <div className='how-copy'>
            <h2 id='how-title'>A new conversation.<br />A familiar beginning.</h2>
            <p className='section-description'>Walrus Memory gives Reggie a memory beyond the chat. The little things you share today help make your next visit feel familiar.</p>
            <ul className='how-steps'>
              <li><MessageCircle aria-hidden='true' /><div><h3>Tell Reggie what you like</h3><p>Your favourite rice, your go-to bread, or how you like your groceries delivered.</p></div></li>
              <li><Database aria-hidden='true' /><div><h3>Walrus Memory saves the useful details</h3><p>Reggie stores preferences with your account, ready to recall in a future conversation.</p></div></li>
              <li><Laptop aria-hidden='true' /><div><h3>Pick up on any device</h3><p>Start a fresh chat and sign in to the same account. Your usual comes with you.</p></div></li>
            </ul>
            <a href={WALRUS_MEMORY_URL} target='_blank' rel='noopener noreferrer' className='site-text-link memory-learn-link'>Meet Walrus Memory <ArrowUpRight className='size-4' aria-hidden='true' /><span className='sr-only'> (opens in a new tab)</span></a>
          </div>
          <ConversationPreview />
        </section>

        <section className='site-container privacy-callout memory-privacy' aria-labelledby='privacy-title'>
          <span className='privacy-icon'><ShieldCheck strokeWidth={1.3} aria-hidden='true' /></span>
          <div><h2 id='privacy-title'>Your memory. Your say.</h2><p>See the details saved with Walrus Memory.<br />Choose what Reggie keeps using next time you chat.</p></div>
          <Link href='/memory' className='site-text-link'>Explore your memory <ArrowRight className='size-4' aria-hidden='true' /></Link>
        </section>

        <section id='questions' className='site-container landing-faq' aria-labelledby='faq-title'>
          <div><h2 id='faq-title'>A few things<br />you might wonder.</h2><p className='section-description'>There’s always room for a question.</p><Link href='/chat' className={buttonStyles('secondary', 'md', 'mt-6')}>Chat with Reggie <ArrowUpRight className='size-4' aria-hidden='true' /></Link></div>
          <div className='faq-list'>
            {QUESTIONS.map(({ question, answer }) => <details key={question}><summary>{question}<ChevronDown className='size-4' aria-hidden='true' /></summary><p>{answer}</p></details>)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
