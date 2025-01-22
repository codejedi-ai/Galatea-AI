import { Button } from "@/components/ui/button"
import Image from 'next/image'
import Link from 'next/link'

export default function ProfileSetup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory-100 via-rose-50 to-earth-100">
      <header className="bg-ivory-200 bg-opacity-90 shadow-md sticky top-0 z-10">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/favicon.png" alt="Galatea.AI Logo" width={40} height={40} />
            <span className="text-2xl font-bold text-earth-700">Galatea.AI</span>
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/about" className="text-earth-600 hover:text-rose-700 transition-colors">About</Link>
            <Link href="/start-swiping" className="text-earth-600 hover:text-rose-700 transition-colors">Start Swiping</Link>
          </div>
          <Button variant="ghost" className="text-earth-700 hover:text-rose-700" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-earth-800 mb-10 text-center">Set Up Your Profile</h1>
        <div className="max-w-2xl mx-auto">
        </div>
      </main>

      <footer className="bg-earth-100 mt-20">
        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-earth-700 mb-4 md:mb-0 text-lg">
              © 2024 Galatea.AI. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-earth-600 hover:text-rose-700 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-earth-600 hover:text-rose-700 transition-colors">Terms of Service</Link>
              <Link href="/contact" className="text-earth-600 hover:text-rose-700 transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

