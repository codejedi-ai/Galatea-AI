"use client"

import { useState } from "react"
import { CircleLoader } from "@/components/circle-loader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface User {
  id: number
  name: string
  email: string
}

export function DataFetchingExample() {
  const [users, setUsers] = useState<User[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock data
      const mockUsers = [
        { id: 1, name: "Alice Johnson", email: "alice@example.com" },
        { id: 2, name: "Bob Smith", email: "bob@example.com" },
        { id: 3, name: "Carol Williams", email: "carol@example.com" },
      ]

      setUsers(mockUsers)
    } catch (err) {
      setError("Failed to fetch users. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Clear data
  const clearData = () => {
    setUsers(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-6">
          <Button onClick={fetchData} disabled={loading}>
            {loading ? "Loading..." : "Fetch Users"}
          </Button>
          <Button variant="outline" onClick={clearData} disabled={loading || !users}>
            Clear Data
          </Button>
        </div>

        <div className="min-h-[300px] border border-border rounded-lg p-4">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <CircleLoader size="medium" message="Fetching users..." />
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-destructive">{error}</div>
          ) : !users ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available. Click "Fetch Users" to load data.
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
