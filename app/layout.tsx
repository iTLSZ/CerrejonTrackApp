import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CerrejonTrackApp',
  description: 'Luis Lopez',
  generator: 'Lals.Dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
