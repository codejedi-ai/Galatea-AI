"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AuthCardProps {
  onSignIn: (email: string, password: string) => Promise<void>
}

export function AuthCard({ onSignIn }: AuthCardProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSignIn(email, password)
    } catch (error) {
      console.error("Sign in failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setResetEmailSent(true)
    }, 1500)
  }

  return (
    <div className="bg-card border border-border rounded-xl w-full max-w-4xl mx-4 z-10 overflow-hidden shadow-lg">
      <div className="flex flex-col md:flex-row">
        {/* Left Side - Email Sign In */}
        <div className="w-full md:w-1/2 p-8">
          {!showForgotPassword ? (
            <>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Sign In</h2>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="text-center mt-6">
                  <p className="text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-primary hover:underline">
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Reset Password</h2>
              <p className="text-muted-foreground mb-6">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              {resetEmailSent ? (
                <div className="bg-primary/10 border border-primary/30 rounded-md p-4 mb-6">
                  <p className="text-foreground">
                    If an account exists with the email <span className="text-primary">{forgotPasswordEmail}</span>
                    , you will receive a password reset link shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false)
                  setResetEmailSent(false)
                }}
                className="mt-4 text-primary hover:underline inline-flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back to sign in
              </button>
            </>
          )}
        </div>

        {/* Divider for desktop */}
        <div className="hidden md:block w-px bg-border"></div>

        {/* Right Side - Social Sign In */}
        <div className="w-full md:w-1/2 p-8 border-t border-border md:border-t-0">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Continue with</h2>
          <div className="space-y-4">
            <button className="social-button w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-md bg-secondary border border-border hover:border-primary/40 text-foreground transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <button className="social-button w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-md bg-secondary border border-border hover:border-primary/40 text-foreground transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
              </svg>
              <span>Sign in with Facebook</span>
            </button>

            <button className="social-button w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-md bg-secondary border border-border hover:border-primary/40 text-foreground transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v19.056c0 1.368-1.104 2.472-2.46 2.472H4.46C3.104 24 2 22.896 2 21.528V2.472C2 1.104 3.104 0 4.46 0h15.08zm-4.63 15.5a.8.8 0 0 0-.798.8v2.399a.8.8 0 0 0 .798.801h2.4a.8.8 0 0 0 .8-.801V16.3a.8.8 0 0 0-.8-.8h-2.4zm-7.6 0a.8.8 0 0 0-.799.8v2.399a.8.8 0 0 0 .799.801h2.4a.8.8 0 0 0 .8-.801V16.3a.8.8 0 0 0-.8-.8h-2.4zm7.6-8a.8.8 0 0 0-.798.8v2.399a.8.8 0 0 0 .798.8h2.4a.8.8 0 0 0 .8-.8V8.3a.8.8 0 0 0-.8-.8h-2.4zm-7.6 0a.8.8 0 0 0-.799.8v2.399a.8.8 0 0 0 .799.8h2.4a.8.8 0 0 0 .8-.8V8.3a.8.8 0 0 0-.8-.8h-2.4z" />
              </svg>
              <span>Sign in with Discord</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              By signing in, you agree to our{" "}
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
  )
}
