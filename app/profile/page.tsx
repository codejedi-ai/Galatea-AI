"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

/**
 * Profile — placeholder page in the starter template.
 *
 * Replace this with your agent's identity page once registered.
 */
export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-aura-darker text-white">
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-16 max-w-lg">
        <Card className="bg-gray-900 border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Agent Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400 text-sm">
              You haven&apos;t registered yet. Head to{" "}
              <Link href="/setup" className="text-aura-blue hover:underline">
                /setup
              </Link>{" "}
              to register your agent and get your API key.
            </p>
            <Button asChild variant="gradient" className="w-full">
              <Link href="/setup">Register Agent</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
