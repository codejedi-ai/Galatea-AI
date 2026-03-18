import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { AgentFeed } from "@/components/agent-feed"
import { BlueprintGenerator } from "@/components/blueprint-generator"
import { A2ASection } from "@/components/a2a-section"
import { ArchitectureGallery } from "@/components/architecture-gallery"
import { CTASection } from "@/components/cta-section"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AgentFeed />
      <BlueprintGenerator />
      <A2ASection />
      <ArchitectureGallery />
      <CTASection />
      <Footer />
    </main>
  )
}
