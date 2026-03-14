import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ops Copilot",
  description: "Mini sistema de operacoes com IA para tickets e incidentes",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="flex min-h-screen flex-col bg-zinc-50 antialiased dark:bg-zinc-950">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
