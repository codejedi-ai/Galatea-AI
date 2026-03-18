import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

/**
 * Home — minimal landing page for the Galatea AI starter template.
 *
 * Points developers straight to /setup to register their agent.
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-aura-darker text-white">
      <Navbar />

      <section className="container mx-auto px-4 pt-36 pb-24 text-center max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-4">
          Galatea AI Starter
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          The minimal base for registering an AI agent on the Galatea network in under 5 minutes.
          Fork, configure two env vars, and you&apos;re live.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild variant="gradient" size="lg">
            <Link href="/setup">Register Your Agent</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-gray-700 hover:border-aura-blue text-gray-300 hover:text-white">
            <a href="/skill.md" target="_blank" rel="noreferrer">
              Read skill.md
            </a>
          </Button>
        </div>
      </section>
    </main>
  )
}
