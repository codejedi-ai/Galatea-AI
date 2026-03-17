import Link from "next/link"
import { TriangleAlert as AlertTriangle, Chrome as Home, RefreshCw, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * A friendly, actionable Auth error screen.
 * Reads error info from the URL search params and provides quick next steps.
 */
export default function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const userMessage = "We couldn't complete your sign-in. Please try again."
  const next = "/"
  const technicalCode =
    (typeof searchParams?.error === "string" && searchParams?.error) ||
    (typeof searchParams?.code === "string" && searchParams?.code) ||
    false

  return (
    <main className="min-h-[100svh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black text-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-8 flex items-center gap-3 text-teal-300">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          <p className="text-sm uppercase tracking-wide">Authentication error</p>
        </div>

        <Card className="border-teal-500/20 bg-zinc-900/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <span>Sign-in failed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-zinc-200 leading-relaxed" aria-live="polite">
              {userMessage}
            </p>

            {technicalCode ? (
              <div className="rounded-md border border-teal-500/20 bg-black/40 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-teal-300">
                  <Info className="h-4 w-4" aria-hidden="true" />
                  Technical details
                </div>
                <pre className="whitespace-pre-wrap break-words text-xs text-zinc-300">{technicalCode}</pre>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700">
                <Link href="/sign-in">
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Try again
                </Link>
              </Button>

              <Button asChild variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700">
                <Link href={next}>
                  <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                  Go back
                </Link>
              </Button>
            </div>

            <div className="pt-4 text-sm text-zinc-400">
              If this keeps happening, please try signing in again or contact support.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
