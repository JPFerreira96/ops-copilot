"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, Lightbulb, ListChecks, Tag } from "lucide-react";
import { toast } from "sonner";
import { AIResponse } from "@/lib/ai";

export function TicketAIPanel({ ticketId, initialData }: { ticketId: string, initialData?: { aiSummary: string | null, aiNextSteps: any, aiRiskLevel: string | null, aiCategories: any } }) {
    const [loading, setLoading] = useState(false);
    const [aiData, setAiData] = useState<AIResponse | null>(() => {
        if (initialData?.aiSummary) {
            return {
                summary: initialData.aiSummary,
                nextSteps: initialData.aiNextSteps ? JSON.parse(initialData.aiNextSteps) : [],
                riskLevel: initialData.aiRiskLevel as any,
                categories: initialData.aiCategories ? JSON.parse(initialData.aiCategories) : []
            }
        }
        return null;
    });

    const generateAI = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/ai/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticketId })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Falha ao gerar IA.");
            }

            const data = await res.json();
            setAiData(data);
            toast.success("Análise de IA concluída com sucesso!");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const riskColors = {
        low: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400",
        medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400",
        high: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400"
    };

    return (
        <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm">
            <CardHeader className="bg-indigo-50/50 dark:bg-indigo-950/20 pb-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                            <Sparkles className="h-5 w-5" />
                            Análise GenAI
                        </CardTitle>
                        <CardDescription>Resumo Inteligente e Plano de Ação</CardDescription>
                    </div>
                    {!aiData && (
                        <Button onClick={generateAI} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {loading ? "Gerando..." : "Analisar com IA"}
                            {!loading && <Sparkles className="ml-2 h-4 w-4" />}
                        </Button>
                    )}
                </div>
            </CardHeader>

            {aiData && (
                <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
                        <div>
                            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-zinc-700 dark:text-zinc-300">
                                <Lightbulb className="h-4 w-4 text-amber-500" />
                                Resumo do Incidente
                            </h4>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-md border">
                                {aiData.summary}
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-zinc-700 dark:text-zinc-300">
                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                    Nível de Risco
                                </h4>
                                <Badge variant="outline" className={`capitalize px-3 py-1 ${riskColors[aiData.riskLevel]}`}>
                                    {aiData.riskLevel === 'high' ? 'Alto Risco' : aiData.riskLevel === 'medium' ? 'Médio Risco' : 'Baixo Risco'}
                                </Badge>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-zinc-700 dark:text-zinc-300">
                                    <Tag className="h-4 w-4 text-blue-500" />
                                    Categorias Identificadas
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {aiData.categories.map((cat, i) => (
                                        <Badge key={i} variant="secondary" className="capitalize text-xs font-medium">
                                            {cat}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3 text-zinc-700 dark:text-zinc-300">
                            <ListChecks className="h-4 w-4 text-emerald-500" />
                            Plano de Ação Sugerido
                        </h4>
                        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 pl-1">
                            {aiData.nextSteps.map((step, i) => (
                                <li key={i} className="flex gap-2">
                                    <span className="text-indigo-500">•</span>
                                    <span>{step.replace("•", "").trim()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
