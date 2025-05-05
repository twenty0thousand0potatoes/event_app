import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'My PWA App',
  description: 'Best app ever',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-800">{children}</body>
    </html>
  )
}