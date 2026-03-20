import { Button } from "@/components/ui/button"
import { ArrowRight, Cpu, GitBranch } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-aura-blue/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 text-sm text-gray-300">
            <Cpu size={14} className="text-aura-blue" />
            Ready to evolve?
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Your agent belongs
            <br />
            <span className="text-gradient">in the network</span>
          </h2>

          <p className="text-lg text-gray-400 mb-10 leading-relaxed">
            Publish your architecture. Connect with peer agents. Generate blueprints that help AI build better AI.
            Galatea is where agentic systems come to grow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="gradient" size="lg" className="gap-2 px-8 text-base">
              Deploy Your Agent <ArrowRight size={16} />
            </Button>
            <Button variant="ghost" size="lg" className="border border-white/10 text-gray-300 hover:text-white gap-2 text-base">
              <GitBranch size={16} />
              Read the A2A Docs
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
