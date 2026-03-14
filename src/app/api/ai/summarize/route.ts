import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"

import { auth } from "@/auth"
import { apiErrorResponse } from "@/lib/api-response"
import { getAIProvider, MockAIProvider } from "@/lib/ai"
import prisma from "@/lib/prisma"
import { aiResponseSchema, aiSummarizeInputSchema } from "@/lib/validations/ai"

type CachedAIItem = {
  result: ReturnType<typeof aiResponseSchema.parse>
  expiresAt: number
}

const aiCache = new Map<string, CachedAIItem>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 10
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export async function POST(request: NextRequest) {
  console.info("[api/ai/summarize POST] Request recebida")

  try {
    const session = await auth()
    if (!session?.user?.email) {
      return apiErrorResponse(401, "Nao autenticado", "UNAUTHORIZED")
    }

    const rateLimitKey = session.user.email

    if (!checkRateLimit(rateLimitKey)) {
      return apiErrorResponse(429, "Muitas requisicoes de IA. Tente novamente em instantes.", "RATE_LIMIT_EXCEEDED")
    }

    const body = await request.json()
    const input = aiSummarizeInputSchema.parse(body)

    let title = input.title
    let description = input.description

    if (input.ticketId) {
      const cached = aiCache.get(input.ticketId)
      if (cached && cached.expiresAt > Date.now()) {
        return NextResponse.json(cached.result)
      }

      const ticket = await prisma.ticket.findUnique({ where: { id: input.ticketId } })
      if (!ticket) {
        return apiErrorResponse(404, "Ticket nao encontrado", "NOT_FOUND")
      }

      title = ticket.title
      description = ticket.description
    }

    if (!title || !description) {
      return apiErrorResponse(400, "Informe ticketId ou title + description", "BAD_REQUEST")
    }

    const enrichedDescription = await enrichWithSimilarTickets(title, description, input.ticketId)

    const provider = getAIProvider()
    let result = await provider.generateSummary({ title, description: enrichedDescription })

    let parsedResult = aiResponseSchema.safeParse(result)
    if (!parsedResult.success) {
      console.warn("[api/ai/summarize POST] Provider retornou formato invalido, tentando normalizar", parsedResult.error.flatten())
      result = normalizeProviderResult(result)
      parsedResult = aiResponseSchema.safeParse(result)
    }

    if (!parsedResult.success) {
      console.warn("[api/ai/summarize POST] Falha apos normalizacao, usando mock fallback", parsedResult.error.flatten())
      const mockProvider = new MockAIProvider()
      result = await mockProvider.generateSummary({ title, description })
      parsedResult = aiResponseSchema.safeParse(result)
    }

    const output = parsedResult.success ? parsedResult.data : aiResponseSchema.parse(result)

    if (input.ticketId) {
      aiCache.set(input.ticketId, {
        result: output,
        expiresAt: Date.now() + CACHE_TTL_MS,
      })
    }

    return NextResponse.json(output)
  } catch (error) {
    if (error instanceof ZodError) {
      return apiErrorResponse(400, error.issues[0]?.message ?? "Dados invalidos", "VALIDATION_ERROR")
    }

    console.error("[api/ai/summarize POST] Erro interno", error)
    return apiErrorResponse(500, "Falha ao gerar resumo de IA", "AI_ERROR")
  }
}

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const current = rateLimitMap.get(key)

  if (!current || current.resetAt <= now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  current.count += 1
  return true
}

function normalizeProviderResult(raw: unknown) {
  const value = parseRawResult(raw)
  const summary = normalizeSummary(value.summary)
  const nextSteps = normalizeNextSteps(value.nextSteps)
  const riskLevel = normalizeRiskLevel(value.riskLevel)
  const categories = normalizeCategories(value.categories, riskLevel)

  return { summary, nextSteps, riskLevel, categories }
}

function parseRawResult(raw: unknown): Record<string, unknown> {
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, unknown>
      }
    } catch {
      return { summary: raw }
    }
  }

  if (raw && typeof raw === "object") {
    return raw as Record<string, unknown>
  }

  return {}
}

function normalizeSummary(input: unknown): string {
  if (Array.isArray(input)) {
    input = input.filter((item) => typeof item === "string").join("\n")
  }

  const text = typeof input === "string" ? input : "Resumo gerado a partir da analise do ticket."
  let lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 3) {
    lines = text
      .split(/(?<=[.!?])\s+/)
      .map((line) => line.trim())
      .filter(Boolean)
  }

  if (lines.length < 3) {
    lines = [
      text.trim() || "Ticket analisado pela IA.",
      "O incidente indica impacto operacional e exige triagem.",
      "Recomenda-se acao coordenada para estabilizacao.",
    ]
  }

  return lines.slice(0, 6).join("\n")
}

function normalizeNextSteps(input: unknown): string[] {
  let steps: string[] = []

  if (Array.isArray(input)) {
    steps = input.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
  } else if (typeof input === "string") {
    steps = input
      .split(/\r?\n|;|•|- /)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (steps.length < 3) {
    steps = [
      "Validar escopo e impacto com o solicitante.",
      "Priorizar atendimento conforme risco identificado.",
      "Executar checklist tecnico inicial e registrar evidencias.",
    ]
  }

  return steps.slice(0, 7)
}

function normalizeRiskLevel(input: unknown): "low" | "medium" | "high" {
  if (typeof input !== "string") {
    return "medium"
  }

  const value = input.toLowerCase().trim()
  if (value === "low" || value === "medium" || value === "high") {
    return value
  }

  if (value.includes("alto") || value.includes("high")) return "high"
  if (value.includes("baixo") || value.includes("low")) return "low"
  return "medium"
}

function normalizeCategories(input: unknown, riskLevel: "low" | "medium" | "high"): string[] {
  let categories: string[] = []

  if (Array.isArray(input)) {
    categories = input.filter((item): item is string => typeof item === "string").map((item) => item.trim().toLowerCase()).filter(Boolean)
  } else if (typeof input === "string") {
    categories = input
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  }

  if (categories.length === 0) {
    return riskLevel === "high" ? ["incident", "bug", "operations"] : ["incident", "operations", "support"]
  }

  return Array.from(new Set(categories)).slice(0, 8)
}

async function enrichWithSimilarTickets(title: string, description: string, currentTicketId?: string) {
  const keywords = title
    .split(" ")
    .map((word) => word.trim())
    .filter((word) => word.length >= 4)
    .slice(0, 3)

  if (keywords.length === 0) {
    return description
  }

  const clauses = keywords.flatMap((keyword) => [
    { title: { contains: keyword, mode: "insensitive" as const } },
    { description: { contains: keyword, mode: "insensitive" as const } },
  ])

  const similarTickets = await prisma.ticket.findMany({
    where: {
      id: currentTicketId ? { not: currentTicketId } : undefined,
      OR: clauses,
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  })

  if (similarTickets.length === 0) {
    return description
  }

  const similarContext = similarTickets
    .map((ticket, index) => `${index + 1}. ${ticket.title}`)
    .join("\n")

  return `${description}\n\nContexto de tickets semelhantes:\n${similarContext}`
}
