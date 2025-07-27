import type React from "react"
import type { Metadata } from "next"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Hybro AI Inspector",
  description: "Open Source A2A Agent Inspector",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="h-screen bg-background">
          <main>
            {children}
          </main>
          <Toaster />
          <footer className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-4xl mx-auto py-8 px-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <h3 className="text-lg font-medium text-gray-900">HYBRO AI - Open A2A Agent Network For Future AGI</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm max-w-md mx-auto">
                  Connect and scale your AI agents in the largest agent network
                </p>
                <a 
                  href="https://hybro.ai/agent" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors duration-200"
                >
                  <span>Join A2A Agent Network</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
