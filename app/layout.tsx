import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProviders } from '@/components/providers/app-providers'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: 'TheBazm | Gorilla Performances & Inflatable Mascots',
  description: 'Premium gorilla performances and inflatable mascot costumes in Islamabad & Rawalpindi. Book events or shop mascots — gorillas, pandas, teddies & more.',
  generator: 'v0.app',
  openGraph: {
    title: 'TheBazm 🦍 | Performances & Mascots',
    description: 'Book premium gorilla performances or shop inflatable mascots for your next event.',
    type: 'website',
    locale: 'en_PK',
    siteName: 'TheBazm',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TheBazm 🦍 | Performances & Mascots',
    description: 'Book premium gorilla performances or shop inflatable mascots for your next event.',
  },
  keywords: ['gorilla performance', 'inflatable mascot', 'event entertainment', 'Islamabad events', 'Rawalpindi events', 'mascot costume Pakistan', 'TheBazm'],
}

export const viewport: Viewport = {
  themeColor: '#9333ea',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <AppProviders>
          {children}
        </AppProviders>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
