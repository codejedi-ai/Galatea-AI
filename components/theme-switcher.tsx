"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themes = [
  {
    id: "rose-earth",
    label: "Rose Earth",
    description: "Warm ivory with rose accents",
    swatches: ["#f7f3ee", "#c0392b", "#d6c9b8"],
  },
  {
    id: "cyber-teal",
    label: "Cyber Teal",
    description: "Dark navy with teal accents",
    swatches: ["#0a0e1a", "#00b8ba", "#1a2540"],
  },

  {
    id: "black-cyan",
    label: "Black Cyan",
    description: "Deep black with neon cyan",
    swatches: ["#0a0a1a", "#00ffff", "#131326"],
  },
  {
    id: "aura",
    label: "Aura",
    description: "Dark blue with purple glow",
    swatches: ["#0b0d1c", "#4a9eff", "#3d2060"],
  },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const current = themes.find((t) => t.id === theme) ?? themes[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Switch theme">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="flex items-center gap-3 cursor-pointer"
          >
            {/* Swatch preview */}
            <div className="flex gap-0.5 rounded overflow-hidden shrink-0">
              {t.swatches.map((color, i) => (
                <span key={i} className="w-3 h-5 block" style={{ backgroundColor: color }} />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-none">{t.label}</p>
            </div>
            {mounted && theme === t.id && (
              <span className="ml-auto text-primary text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
