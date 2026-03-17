import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import SupabaseConfigScript from "@/components/supabase-config";
import { SimpleAuthProvider } from "@/contexts/simple-auth-context";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Galatea.AI - Your AI Wingman',
  description: 'Connect with sophisticated AI companions for meaningful conversations, emotional support, and confidence building.',
  generator: 'Galatea.AI',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <SupabaseConfigScript />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <SimpleAuthProvider>
          {children}
          <Toaster />
        </SimpleAuthProvider>
      </body>
    </html>
  )
}
