import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-background">
            <main>
              {children}
            </main>
            <Toaster richColors closeButton />
            <footer className="bg-card border-t border-border">
              <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
                <div className="bg-background rounded-lg border border-border p-6 text-center shadow-sm">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <h3 className="text-lg font-medium text-foreground">HYBRO AI - Open A2A Agent Network For Future AGI</h3>
                  </div>
                  <p className="text-muted-foreground mb-4 text-sm max-w-md mx-auto">
                    Connect and scale your AI agents in the largest agent network
                  </p>
                  <a 
                    href="https://hybro.ai/agents" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 btn-brand-gradient px-6 py-2 rounded-md font-medium transition-colors duration-200"
                  >
                    <span>Join A2A Agent Network</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
