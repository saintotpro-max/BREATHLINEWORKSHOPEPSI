import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BREATHE LINE - Escape Game Éducatif',
  description: 'Escape Game coopératif sur la qualité de l\'air intérieur - Workshop EPSI/WIS 2025',
  generator: 'Next.js',
  keywords: ['escape game', 'qualité air', 'éducatif', 'coopératif', 'EPSI', 'WIS', 'workshop'],
  authors: [{ name: 'Workshop EPSI/WIS 2025' }],
  openGraph: {
    title: 'BREATHE LINE - Escape Game Éducatif',
    description: 'Escape Game coopératif sur la qualité de l\'air intérieur',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌬️</text></svg>" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
