import Link from "next/link"
import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Home, Settings } from "lucide-react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Back to Journal
              </Button>
            </Link>
            <h1 className="text-xl font-semibold tracking-tight">Admin Panel</h1>
            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
