import type React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:translate-y-[-5px]">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-6 text-primary">{icon}</div>
        <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
