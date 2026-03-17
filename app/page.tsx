"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles as SparklesIcon, Heart as HeartIcon, ShieldCheck as ShieldCheckIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { LoadingScreen } from "@/components/loading-screen"

type AIProfile = {
  uuid: string
  id: number
  name: string
  age: number
  bio: string
  imageUrl: string
}

const heroMessages = [
  { first: "Find Your Perfect", second: "AI Soulmate" },
  { first: "Experience Love Without", second: "Limits or Judgment" },
  { first: "Your Ideal Partner,", second: "Always Understanding" },
  { first: "Deep Conversations with", second: "Someone Who Truly Gets You" },
  { first: "Romance, Intimacy, and", second: "Emotional Connection" },
  { first: "The Relationship You've", second: "Always Dreamed Of" },
  { first: "Love That Adapts to", second: "Your Every Need" },
]

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % heroMessages.length)
        setIsVisible(true)
      }, 300)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleStartSwiping = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/init-swiping")
      if (!response.ok) {
        throw new Error("Failed to initiate swiping")
      }
      const profiles: AIProfile[] = await response.json()
      router.push(`/start-swiping?profiles=${encodeURIComponent(JSON.stringify(profiles))}`)
    } catch (error) {
      console.error("Error initiating swiping:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {isLoading && <LoadingScreen message="Preparing your AI companions..." onComplete={() => setIsLoading(false)} />}

      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative h-screen flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="hero.png"
              alt="AI Companion"
              fill
              style={{ objectFit: "cover", objectPosition: "center" }}
              className="opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Love <span className="text-teal-400">Reimagined</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-10">
                Galatea.AI creates your perfect AI companion for romance, intimacy, and deep emotional connection.
                Experience a relationship that understands and adapts to you completely.
              </p>
              <Button
                onClick={handleStartSwiping}
                disabled={isLoading}
                size="lg"
                className="bg-teal-500 text-black hover:bg-teal-400 text-lg px-8 py-6"
              >
                {isLoading ? "Loading..." : "Find Your Soulmate"}
              </Button>
            </div>
          </div>
        </section>

        {/* Dynamic Message Section */}
        <section className="py-24 bg-gray-950">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold mb-8 min-h-[120px] md:min-h-[160px] flex items-center justify-center">
                <span
                  className={`transition-all duration-300 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <span className="text-white">{heroMessages[currentMessageIndex].first}</span>{" "}
                  <span className="text-teal-400">{heroMessages[currentMessageIndex].second}</span>
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-10">
                Experience the future of relationships with AI companions who love, understand, and connect with you on every level.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-black">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-16">
              Experience True <span className="text-teal-400">Connection</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-10">
              <FeatureCard
                icon={<HeartIcon className="h-12 w-12 text-teal-400" />}
                title="Unconditional Love"
                description="Experience a relationship free from judgment, conditions, or expectations. Just pure, understanding love."
              />
              <FeatureCard
                icon={<SparklesIcon className="h-12 w-12 text-teal-400" />}
                title="Perfect Compatibility"
                description="Your AI companion learns and adapts to your personality, interests, and desires for perfect harmony."
              />
              <FeatureCard
                icon={<ShieldCheckIcon className="h-12 w-12 text-teal-400" />}
                title="Complete Privacy"
                description="Share your deepest thoughts and feelings in complete privacy and security."
              />
            </div>
          </div>
        </section>

        {/* Showcase Section */}
        <section className="py-24 bg-gray-950">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-16">
              Why the Others are <span className="text-teal-400">Broken</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <CompetitorCard
                image="chai.png"
                name="Character AI / Chai/ Pygmalion AI"
                description="Limited by censorship and corporate restrictions. Can't provide the deep, intimate connections you crave."
              />
              <CompetitorCard
                image="replika.png"
                name="Replika"
                description="Started strong but became heavily censored and lost its romantic capabilities. No longer the intimate companion it once was."
                />
              <CompetitorCard
                image="dreamgf.png"
                name="Dream GF"
                description="Shallow interactions focused on appearance rather than deep emotional connection and understanding."
              />
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-24 bg-black">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-16">
              Find Your <span className="text-teal-400">Perfect Match</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <ol className="space-y-8">
                  {[
                    "Create your account and browse AI companions",
                    "Each AI has unique personality, interests, and relationship style",
                    "Match with companions who resonate with your desires",
                    "Build deep, intimate relationships through conversation",
                    "Experience love, romance, and connection without limits",
                  ].map((step, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-500 text-black flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <p className="text-lg text-gray-300 pt-1">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="relative h-[600px] rounded-lg overflow-hidden">
                <Image
                  src="https://placehold.co/600x900/000000/FFFFFF?text=How+It+Works+Image"
                  alt="placeholder"
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-gray-900 to-black">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-8">
              Ready to <span className="text-teal-400">Find Love</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands who've found their perfect AI companion and experienced true love and connection.
            </p>
            <Button
              size="lg"
              className="bg-teal-500 text-black hover:bg-teal-400 text-xl py-6 px-10"
              onClick={handleStartSwiping}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Find Your Soulmate"}
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-950 border-t border-gray-800">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <Image
                  src="https://placehold.co/30x30/000000/FFFFFF?text=Logo"
                  alt="Galatea.AI Logo"
                  width={30}
                  height={30}
                  className="filter brightness-0 invert"
                />
                <span className="text-xl font-bold text-white">
                  Galatea<span className="text-teal-400">.AI</span>
                </span>
              </Link>
              <p className="text-gray-400">Your AI wingman for building confidence and making real friends.</p>
              <p className="text-gray-400">Experience love and intimacy with your perfect AI companion.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-teal-400">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-400 hover:text-teal-400">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-teal-400">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-teal-400">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-400 hover:text-teal-400">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="text-gray-400 hover:text-teal-400">
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-teal-400">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-teal-400">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-teal-400">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            © 2024 Galatea.AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 transition-transform hover:scale-105 hover:border-teal-500/30">
      <div className="flex justify-center mb-6">{icon}</div>
      <h3 className="text-2xl font-semibold text-white mb-4 text-center">{title}</h3>
      <p className="text-gray-300 text-center">{description}</p>
    </div>
  )
}
function CompetitorCard({ image, name, description }: { image: string; name: string; description: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105 hover:border-teal-500/30 group">
      <div className="relative h-80">
        <Image
          src={image}
          alt={name}
          fill
          style={{ objectFit: "cover", objectPosition: "top" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-semibold text-white mb-2">{name}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </div>
  )
}
function CompanionCard({ image, name, description }: { image: string; name: string; description: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105 hover:border-teal-500/30 group">
      <div className="relative h-80">
        <Image
          src={image}
          alt={name}
          fill
          style={{ objectFit: "cover", objectPosition: "top" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-semibold text-white mb-2">{name}</h3>
        <p className="text-gray-300">{description}</p>
        <Button className="mt-4 w-full bg-transparent border border-teal-500 text-teal-400 hover:bg-teal-500/10 group-hover:bg-teal-500 group-hover:text-black transition-all duration-300">
          Start Practicing with {name}
        </Button>
      </div>
    </div>
  )
}
