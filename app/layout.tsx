import type { Metadata } from 'next'
import './globals.css'
import { LayoutContent } from '@/components/LayoutContent'

export const metadata: Metadata = {
  title: 'Sudhakant Sarees - Elegant Indian Sarees Collection',
  description: 'Discover exquisite collection of traditional Indian sarees including Silk, Cotton, Banarasi, Kanjivaram, and Patola sarees. Authentic craftsmanship and elegant designs.',
  keywords: 'sarees, silk sarees, banarasi sarees, kanjivaram sarees, indian sarees, traditional sarees',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  )
}
