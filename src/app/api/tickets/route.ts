import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { ZodError } from "zod"

import { auth } from "@/auth"
import { apiErrorResponse } from "@/lib/api-response"
import prisma from "@/lib/prisma"
import { toTicketPriority, toTicketStatus } from "@/lib/ticket-meta"
import { ticketListQuerySchema, ticketSchema } from "@/lib/validations/ticket"

export async function GET(request: NextRequest) {
  console.info("[api/tickets GET] Request recebida")

  try {
    const session = await auth()
    if (!session?.user?.email) {
      return apiErrorResponse(401, "Nao autenticado", "UNAUTHORIZED")
    }

    const rawQuery = Object.fromEntries(request.nextUrl.searchParams.entries())
    const query = ticketListQuerySchema.parse(rawQuery)

    const whereClause: Prisma.TicketWhereInput = {}

    if (query.search) {
      whereClause.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ]
    }

    if (query.status) {
      const statusList = query.status
        .split(",")
        .map((value) => toTicketStatus(value.trim()))
        .filter((value): value is NonNullable<typeof value> => Boolean(value))

      if (statusList.length > 0) {
        whereClause.status = { in: statusList }
      }
    }

    if (query.priority) {
      const priority = toTicketPriority(query.priority)
      if (priority) {
        whereClause.priority = priority
      }
    }

    if (query.tags) {
      const tags = query.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)

      if (tags.length > 0) {
        whereClause.tags = { hasSome: tags }
      }
    }

    const skip = (query.page - 1) * query.limit

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: query.limit,
      }),
      prisma.ticket.count({ where: whereClause }),
    ])

    return NextResponse.json({
      data: tickets,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return apiErrorResponse(400, error.issues[0]?.message ?? "Parametros invalidos", "VALIDATION_ERROR")
    }

    console.error("[api/tickets GET] Erro interno", error)
    return apiErrorResponse(500, "Falha ao buscar tickets", "FETCH_ERROR")
  }
}

export async function POST(request: NextRequest) {
  console.info("[api/tickets POST] Request recebida")

  try {
    const session = await auth()
    if (!session?.user?.email) {
      return apiErrorResponse(401, "Nao autenticado", "UNAUTHORIZED")
    }

    const body = await request.json()
    const validatedData = ticketSchema.parse(body)

    const ticket = await prisma.ticket.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        priority: validatedData.priority,
        tags: validatedData.tags,
      },
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return apiErrorResponse(400, error.issues[0]?.message ?? "Dados invalidos", "VALIDATION_ERROR")
    }

    console.error("[api/tickets POST] Erro interno", error)
    return apiErrorResponse(500, "Falha ao criar ticket", "CREATE_ERROR")
  }
}
