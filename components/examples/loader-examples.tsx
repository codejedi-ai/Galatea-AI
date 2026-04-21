"use client"

import { CircleLoader } from "@/components/circle-loader"
import { Card } from "@/components/ui/card"

export function LoaderExamples() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-foreground">Circle Loader Examples</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Small loader in a card */}
        <Card className="p-6 flex flex-col items-center">
          <h3 className="text-lg font-medium mb-4">Small Loader</h3>
          <CircleLoader size="small" message="Loading..." />
        </Card>

        {/* Medium loader in a card */}
        <Card className="p-6 flex flex-col items-center">
          <h3 className="text-lg font-medium mb-4">Medium Loader</h3>
          <CircleLoader size="medium" message="Processing data..." />
        </Card>

        {/* Large loader in a card */}
        <Card className="p-6 flex flex-col items-center">
          <h3 className="text-lg font-medium mb-4">Large Loader</h3>
          <CircleLoader size="large" message="Initializing AI..." />
        </Card>
      </div>

      {/* Content placeholder example */}
      <div className="border border-border rounded-lg p-6">
        <h3 className="text-xl font-medium mb-6">Content Placeholder Example</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded-md animate-pulse"></div>
            <div className="h-32 bg-muted rounded-md animate-pulse"></div>
            <div className="h-8 bg-muted rounded-md animate-pulse"></div>
          </div>
          <div className="flex items-center justify-center">
            <CircleLoader message="Loading content..." />
          </div>
        </div>
      </div>

      {/* Button to demonstrate fullPage loader */}
      <div className="mt-8">
        <p className="text-muted-foreground mb-2">Click the button below to see the full page loader:</p>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          onClick={() => {
            // This would typically be in a React component with state
            alert(
              'In a real implementation, this would show the full page loader using: <CircleLoader fullPage={true} message="Loading page..." />',
            )
          }}
        >
          Show Full Page Loader
        </button>
      </div>
    </div>
  )
}
