"use client"

import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

export function TicketsErrorState({ message }: { message: string }) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-rose-50 p-8 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-rose-500" />
      <h3 className="text-lg font-semibold">Falha ao carregar tickets</h3>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <Button className="mt-4" variant="outline" onClick={() => router.refresh()}>
        Tentar novamente
      </Button>
    </div>
  )
}