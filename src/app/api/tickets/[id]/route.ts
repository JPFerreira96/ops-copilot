import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"

import { auth } from "@/auth"
import { apiErrorResponse } from "@/lib/api-response"
import prisma from "@/lib/prisma"
import { ticketIdParamSchema, ticketUpdateSchema } from "@/lib/validations/ticket"

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  console.info("[api/tickets/[id] GET] Request recebida")

  try {
    const session = await auth()
    if (!session?.user?.email) {
      return apiErrorResponse(401, "Nao autenticado", "UNAUTHORIZED")
    }

    const params = await context.params
    const { id } = ticketIdParamSchema.parse(params)

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    })

    if (!ticket) {
      return apiErrorResponse(404, "Ticket nao encontrado", "NOT_FOUND")
    }

    return NextResponse.json(ticket)
  } catch (error) {
    if (error instanceof ZodError) {
      return apiErrorResponse(400, error.issues[0]?.message ?? "Dados invalidos", "VALIDATION_ERROR")
    }

    console.error("[api/tickets/[id] GET] Erro interno", error)
    return apiErrorResponse(500, "Falha ao buscar ticket", "FETCH_ERROR")
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  console.info("[api/tickets/[id] PUT] Request recebida")

  try {
    const session = await auth()
    if (!session?.user?.email) {
      return apiErrorResponse(401, "Nao autenticado", "UNAUTHORIZED")
    }

    const params = await context.params
    const { id } = ticketIdParamSchema.parse(params)

    const payload = await request.json()
    const validatedData = ticketUpdateSchema.parse(payload)

    const existingTicket = await prisma.ticket.findUnique({ where: { id } })
    if (!existingTicket) {
      return apiErrorResponse(404, "Ticket nao encontrado", "NOT_FOUND")
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    if (error instanceof ZodError) {
      return apiErrorResponse(400, error.issues[0]?.message ?? "Dados invalidos", "VALIDATION_ERROR")
    }

    console.error("[api/tickets/[id] PUT] Erro interno", error)
    return apiErrorResponse(500, "Falha ao atualizar ticket", "UPDATE_ERROR")
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  console.info("[api/tickets/[id] DELETE] Request recebida")

  try {
    const session = await auth()
    if (!session?.user?.email) {
      return apiErrorResponse(401, "Nao autenticado", "UNAUTHORIZED")
    }

    const params = await context.params
    const { id } = ticketIdParamSchema.parse(params)

    const existingTicket = await prisma.ticket.findUnique({ where: { id } })
    if (!existingTicket) {
      return apiErrorResponse(404, "Ticket nao encontrado", "NOT_FOUND")
    }

    await prisma.ticket.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return apiErrorResponse(400, error.issues[0]?.message ?? "Dados invalidos", "VALIDATION_ERROR")
    }

    console.error("[api/tickets/[id] DELETE] Erro interno", error)
    return apiErrorResponse(500, "Falha ao remover ticket", "DELETE_ERROR")
  }
}
