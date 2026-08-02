import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProviders } from '@/components/providers/app-providers'
import { loadSiteConfig } from '@/lib/store'
import { DEFAULT_PRE_ORDER } from '@/lib/types/pre-order'
import { SEO_KEYWORDS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo/site'
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Inflatable Mascot Shop — Buy Online in Pakistan`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'shopping',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} | Inflatable Mascot Shop Pakistan`,
    description: SITE_DESCRIPTION,
    type: 'website',
    locale: 'en_PK',
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Inflatable Mascot Shop`,
    description: SITE_DESCRIPTION,
  },
  keywords: SEO_KEYWORDS,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#9333ea',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let initialPreOrder = DEFAULT_PRE_ORDER
  try {
    const config = await loadSiteConfig()
    initialPreOrder = config.preOrder ?? DEFAULT_PRE_ORDER
  } catch {
    /* use defaults */
  }

  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <AppProviders initialPreOrder={initialPreOrder}>
          {children}
        </AppProviders>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
