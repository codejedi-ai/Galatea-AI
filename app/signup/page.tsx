"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { LoadingScreen } from "@/components/loading"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
    {...props}
  >
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
);

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
      clipRule="evenodd"
    />
  </svg>
);

const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
      clipRule="evenodd"
    />
  </svg>
);
export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Creating your account...")

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoadingMessage("Creating your account...")

    // Simulate account creation process
    setTimeout(() => {
      setLoadingMessage("Setting up your profile...")
    }, 1500)

    setTimeout(() => {
      setLoadingMessage("Almost done...")
    }, 3000)

    setTimeout(() => {
      router.push("/dashboard")
    }, 4500)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Loading Screen */}
      {isLoading && <LoadingScreen message={loadingMessage} />}

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/signup.jpeg"
          alt="Galatea background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40 backdrop-blur-sm"></div>
      </div>

      {/* Logo */}
      <div className="absolute top-8 left-8 z-10">
        <Logo size="medium" />
      </div>

      {/* Sign Up Card */}
      <div className="rounded-xl w-full max-w-4xl mx-4 z-10 overflow-hidden bg-card/80 backdrop-blur-md border border-border">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Sign Up Form */}
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Create Account</h2>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground/90">
                  Full Name
                </Label>
                <Input id="name" type="text" placeholder="Enter your full name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/90">
                  Email
                </Label>
                <Input id="email" type="email" placeholder="Enter your email" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground/90">
                  Password
                </Label>
                <Input id="password" type="password" placeholder="Create a password" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground/90">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Create Account
              </Button>

              <div className="text-center mt-6">
                <p className="text-foreground/70">
                  Already have an account?{" "}
                  <Link href="/signin" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Divider for desktop */}
          <div className="hidden md:block w-px bg-border"></div>

          {/* Right Side - Benefits */}
          <div className="w-full md:w-1/2 p-8 border-t border-border md:border-t-0">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Benefits</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <HeartIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Personalized Companions</h3>
                  <p className="text-foreground/70">
                    Create and customize AI companions tailored to your preferences.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <SparklesIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Advanced AI Technology</h3>
                  <p className="text-foreground/70">
                    Experience cutting-edge AI that learns and adapts to your interactions.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <ShieldCheckIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Privacy & Security</h3>
                  <p className="text-foreground/70">
                    Your data is encrypted and protected with the highest security standards.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-foreground/50 text-sm">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="text-primary/70 hover:text-primary">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary/70 hover:text-primary">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animated particles */}
      <div className="particles"></div>
    </div>
  )
}
