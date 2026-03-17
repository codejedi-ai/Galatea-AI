# Discord OAuth Setup Guide

1) Enable Discord provider in your Supabase project's Authentication → Providers.
2) Add redirect URLs:
   - http://localhost:3000/auth/callback (development)
   - https://your-domain.com/auth/callback (production)
3) In Discord Developer Portal, create an application and add the same redirect URLs.
4) In your hosting environment (e.g., Vercel), set your Supabase project URL and public anon key as environment variables. Do not hardcode them in client code.
5) The app injects these values at runtime using a server-rendered script so they are not bundled into client code.
\`\`\`

\`\`\`tsx file="app/layout.tsx"
[v0-no-op-code-block-prefix]import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import SupabaseConfigScript from "@/components/supabase-config";
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <SupabaseConfigScript />
        {children}
      </body>
    </html>
  )
}
