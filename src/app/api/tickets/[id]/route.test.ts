import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const prismaMock = vi.hoisted(() => ({
  ticket: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock("@/lib/prisma", () => ({
  default: prismaMock,
}))

vi.mock("@/auth", () => ({
  auth: vi.fn(async () => ({
    user: { email: "admin@opscopilot.com" },
  })),
}))

import { PATCH } from "./route"

const ticketId = "ck1234567890123456789012"
const context = { params: Promise.resolve({ id: ticketId }) }

describe("/api/tickets/[id] PATCH", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("retorna erro padronizado quando payload de atualizacao e invalido", async () => {
    const request = new NextRequest(`http://localhost:3000/api/tickets/${ticketId}`, {
      method: "PATCH",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    })

    const response = await PATCH(request, context)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      code: "VALIDATION_ERROR",
    })
  })

  it("retorna 404 quando ticket nao existe", async () => {
    prismaMock.ticket.findUnique.mockResolvedValue(null)

    const request = new NextRequest(`http://localhost:3000/api/tickets/${ticketId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "DONE" }),
      headers: { "Content-Type": "application/json" },
    })

    const response = await PATCH(request, context)
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body).toMatchObject({
      success: false,
      code: "NOT_FOUND",
    })
    expect(prismaMock.ticket.update).not.toHaveBeenCalled()
  })

  it("atualiza ticket com sucesso", async () => {
    prismaMock.ticket.findUnique.mockResolvedValue({
      id: ticketId,
      title: "Falha na integracao de fila em producao",
      description: "Servicos ficaram sem processar mensagens por 15 minutos.",
      status: "OPEN",
      priority: "HIGH",
      tags: ["fila", "incident"],
      createdAt: new Date("2026-03-13T10:00:00.000Z"),
      updatedAt: new Date("2026-03-13T10:00:00.000Z"),
    })

    prismaMock.ticket.update.mockResolvedValue({
      id: ticketId,
      title: "Falha na integracao de fila em producao",
      description: "Servicos ficaram sem processar mensagens por 15 minutos.",
      status: "DONE",
      priority: "HIGH",
      tags: ["fila", "incident", "resolvido"],
      createdAt: new Date("2026-03-13T10:00:00.000Z"),
      updatedAt: new Date("2026-03-14T10:15:00.000Z"),
    })

    const request = new NextRequest(`http://localhost:3000/api/tickets/${ticketId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "DONE", tags: ["fila", "incident", "resolvido"] }),
      headers: { "Content-Type": "application/json" },
    })

    const response = await PATCH(request, context)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.status).toBe("DONE")
    expect(prismaMock.ticket.update).toHaveBeenCalledWith({
      where: { id: ticketId },
      data: { status: "DONE", tags: ["fila", "incident", "resolvido"] },
    })
  })
})
