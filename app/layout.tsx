import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Imposters Game',
  description: 'A fun imposter game for friends',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

