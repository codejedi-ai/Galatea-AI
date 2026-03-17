import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  size?: "small" | "medium" | "large"
  showText?: boolean
  className?: string
}

export function Logo({ size = "medium", showText = true, className = "" }: LogoProps) {
  const sizes = {
    small: 30,
    medium: 40,
    large: 120,
  }

  const dimension = sizes[size]

  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <Image
          src="/favicon.png"
          alt="Galatea.AI Logo"
          width={dimension}
          height={dimension}
          className="filter brightness-0 invert"
        />
      </div>
      {showText && (
        <span
          className={`font-bold text-white ${size === "large" ? "text-3xl" : size === "small" ? "text-lg" : "text-2xl"}`}
        >
          Galatea<span className="text-teal-400">.AI</span>
        </span>
      )}
    </Link>
  )
}
