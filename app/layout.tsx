import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Outfit, Geist_Mono } from 'next/font/google'
import './globals.css'
import './site.css'
import { SessionProvider } from './_components/session-provider'
import { REGENT_URL, STORE_URL } from '@/config/sites'

const isStore = process.env.REGENT_SITE === 'store'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(STORE_URL.startsWith('http') ? STORE_URL : REGENT_URL),
  title: {
    default: isStore ? 'Regency Stores | Groceries in Lagos' : 'Regent | A grocery assistant powered by Walrus Memory',
    template: isStore ? '%s, Regency Stores' : '%s, Regent',
  },
  description: isStore
    ? 'Browse fresh produce, pantry favourites and everyday essentials at Regency Stores in Lagos. Build your list and chat with Reggie.'
    : 'Meet Reggie, your grocery assistant. Powered by Walrus Memory to save your preferences and recall them across conversations, visits, and devices.',
  applicationName: isStore ? 'Regency Stores' : 'Regent',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eeebf2' },
    { media: '(prefers-color-scheme: dark)', color: '#14111b' },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' className={outfit.variable + ' ' + geistMono.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('regent:theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}" }} />
      </head>
      <body className='min-h-[100dvh]'>
        {isStore ? children : <SessionProvider>{children}</SessionProvider>}
      </body>
    </html>
  )
}
