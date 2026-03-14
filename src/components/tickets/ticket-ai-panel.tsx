"use client"

import { useState } from "react"
import { AlertTriangle, Lightbulb, ListChecks, Sparkles, Tag } from "lucide-react"
import { toast } from "sonner"

import type { AIResponse } from "@/lib/ai"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type TicketAIPanelProps = {
  ticketId: string
  isMockMode: boolean
}

export function TicketAIPanel({ ticketId, isMockMode }: TicketAIPanelProps) {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [aiData, setAiData] = useState<AIResponse | null>(null)

  const generateAI = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      })

      const data = (await res.json()) as AIResponse | { success: false; error: string }

      if (!res.ok) {
        const message = "error" in data ? data.error : "Falha ao gerar analise de IA."
        throw new Error(message)
      }

      setAiData(data as AIResponse)
      toast.success("Analise de IA concluida com sucesso")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao gerar analise de IA."
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const riskColors: Record<AIResponse["riskLevel"], string> = {
    low: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400",
    high: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400",
  }

  return (
    <Card className="border-indigo-100 shadow-sm dark:border-indigo-900/50">
      <CardHeader className="border-b bg-indigo-50/50 pb-4 dark:bg-indigo-950/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl text-indigo-700 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
              IA Summary
            </CardTitle>
            <CardDescription>Resumo inteligente e proximos passos sugeridos</CardDescription>
          </div>

          <Button onClick={generateAI} disabled={loading} className="bg-indigo-600 text-white hover:bg-indigo-700">
            {loading ? "Gerando..." : "Gerar/Resumir com IA"}
            {!loading && <Sparkles className="ml-2 h-4 w-4" />}
          </Button>
        </div>

        {isMockMode && (
          <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Modo Mock ativo: nenhuma chave de IA real foi configurada.
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            <p>{errorMessage}</p>
            <Button className="mt-2" size="sm" variant="outline" onClick={generateAI}>
              Tentar novamente
            </Button>
          </div>
        )}
      </CardHeader>

      {aiData && (
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 gap-6 border-b pb-6 md:grid-cols-2">
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Resumo do incidente
              </h4>
              <p className="rounded-md border bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400 whitespace-pre-line">
                {aiData.summary}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  Nivel de risco
                </h4>
                <Badge variant="outline" className={`px-3 py-1 capitalize ${riskColors[aiData.riskLevel]}`}>
                  {aiData.riskLevel}
                </Badge>
              </div>

              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <Tag className="h-4 w-4 text-blue-500" />
                  Categorias
                </h4>
                <div className="flex flex-wrap gap-2">
                  {aiData.categories.map((category) => (
                    <Badge key={category} variant="secondary" className="text-xs font-medium capitalize">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              <ListChecks className="h-4 w-4 text-emerald-500" />
              Proximos passos
            </h4>
            <ul className="space-y-2 pl-1 text-sm text-zinc-600 dark:text-zinc-400">
              {aiData.nextSteps.map((step, index) => (
                <li key={`${step}-${index}`} className="flex gap-2">
                  <span className="text-indigo-500">-</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
