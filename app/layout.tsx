import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Canary - AI Assistant for Harness',
  description: 'AI assistant for Harness platform operations. Get help with CI/CD pipelines, IDP services, CCM cost optimization, IR incident workflows, environments, and infrastructure configurations.',
    generator: 'v0.dev'
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
