import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Canary - Harness AI Assistant',
  description: 'AI-powered assistant for Harness platform operations. Generate pipelines, services, environments, and more.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
