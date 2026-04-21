import type React from "react"
import { Sidebar } from "@/public/loading"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <div className="md:ml-64 min-h-screen transition-all duration-300">{children}</div>
    </div>
  )
}
