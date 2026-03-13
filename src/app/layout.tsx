import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ops Copilot",
  description: "Mini-sistema de operações com IA para tickets e incidentes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="antialiased min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
