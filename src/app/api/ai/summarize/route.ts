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

    const parsedResult = aiResponseSchema.safeParse(result)
    if (!parsedResult.success) {
      console.warn("[api/ai/summarize POST] Provider retornou formato invalido, usando mock fallback")
      const mockProvider = new MockAIProvider()
      result = await mockProvider.generateSummary({ title, description })
    }

    const output = aiResponseSchema.parse(result)

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
