"use client"

import { useState } from "react"
import { AlertTriangle, Lightbulb, ListChecks, Sparkles, Tag } from "lucide-react"
import { toast } from "sonner"

import { AIResponse } from "@/lib/ai"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type InitialAIData = {
    aiSummary: string | null
    aiNextSteps: string | null
    aiRiskLevel: string | null
    aiCategories: string | null
}

export function TicketAIPanel({
    ticketId,
    initialData,
}: {
    ticketId: string
    initialData?: InitialAIData
}) {
    const [loading, setLoading] = useState(false)
    const [aiData, setAiData] = useState<AIResponse | null>(() => {
        if (!initialData?.aiSummary) {
            return null
        }

        return {
            summary: initialData.aiSummary,
            nextSteps: parseJsonStringArray(initialData.aiNextSteps),
            riskLevel: parseRiskLevel(initialData.aiRiskLevel),
            categories: parseJsonStringArray(initialData.aiCategories),
        }
    })

    const generateAI = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/ai/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticketId }),
            })

            if (!res.ok) {
                const err = (await res.json()) as { message?: string }
                throw new Error(err.message || "Falha ao gerar IA.")
            }

            const data = (await res.json()) as AIResponse
            setAiData(data)
            toast.success("Analise de IA concluida com sucesso!")
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message)
            } else {
                toast.error("Falha ao gerar analise de IA.")
            }
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
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-xl text-indigo-700 dark:text-indigo-400">
                            <Sparkles className="h-5 w-5" />
                            Analise GenAI
                        </CardTitle>
                        <CardDescription>Resumo inteligente e plano de acao</CardDescription>
                    </div>
                    {!aiData && (
                        <Button onClick={generateAI} disabled={loading} className="bg-indigo-600 text-white hover:bg-indigo-700">
                            {loading ? "Gerando..." : "Analisar com IA"}
                            {!loading && <Sparkles className="ml-2 h-4 w-4" />}
                        </Button>
                    )}
                </div>
            </CardHeader>

            {aiData && (
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-6 border-b pb-6 md:grid-cols-2">
                        <div>
                            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                <Lightbulb className="h-4 w-4 text-amber-500" />
                                Resumo do incidente
                            </h4>
                            <p className="rounded-md border bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400">
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
                                    {aiData.riskLevel === "high"
                                        ? "Alto risco"
                                        : aiData.riskLevel === "medium"
                                            ? "Medio risco"
                                            : "Baixo risco"}
                                </Badge>
                            </div>
                            <div>
                                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                    <Tag className="h-4 w-4 text-blue-500" />
                                    Categorias identificadas
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
                            Plano de acao sugerido
                        </h4>
                        <ul className="space-y-2 pl-1 text-sm text-zinc-600 dark:text-zinc-400">
                            {aiData.nextSteps.map((step, index) => (
                                <li key={`${step}-${index}`} className="flex gap-2">
                                    <span className="text-indigo-500">-</span>
                                    <span>{step.replace("•", "").trim()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            )}
        </Card>
    )
}

function parseJsonStringArray(value: string | null): string[] {
    if (!value) return []

    try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed)
            ? parsed.filter((item): item is string => typeof item === "string")
            : []
    } catch {
        return []
    }
}

function parseRiskLevel(value: string | null): AIResponse["riskLevel"] {
    if (value === "high" || value === "medium" || value === "low") {
        return value
    }
    return "low"
}
