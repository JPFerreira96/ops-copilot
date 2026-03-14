import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const prismaMock = vi.hoisted(() => ({
  ticket: {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
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

import { GET, POST } from "./route"

describe("/api/tickets", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("lista tickets com filtros e paginação", async () => {
    prismaMock.ticket.findMany.mockResolvedValue([
      {
        id: "ck1234567890123456789012",
        title: "Falha de autenticacao no login",
        description: "Erro 500 no endpoint de autenticacao em producao",
        status: "OPEN",
        priority: "HIGH",
        tags: ["bug", "incident"],
        createdAt: new Date("2026-03-13T10:00:00.000Z"),
        updatedAt: new Date("2026-03-13T10:00:00.000Z"),
      },
    ])
    prismaMock.ticket.count.mockResolvedValue(1)

    const request = new NextRequest(
      "http://localhost:3000/api/tickets?search=autenticacao&status=open&priority=high&tags=bug,incident&page=1&limit=20",
    )
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.meta.page).toBe(1)
    expect(body.meta.limit).toBe(20)
    expect(body.meta.total).toBe(1)
    expect(prismaMock.ticket.findMany).toHaveBeenCalledTimes(1)
    expect(prismaMock.ticket.count).toHaveBeenCalledTimes(1)
  })

  it("retorna erro padronizado quando payload de criação é inválido", async () => {
    const request = new NextRequest("http://localhost:3000/api/tickets", {
      method: "POST",
      body: JSON.stringify({
        title: "curto",
        description: "descricao curta",
        status: "OPEN",
        priority: "HIGH",
        tags: [],
      }),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      code: "VALIDATION_ERROR",
    })
    expect(typeof body.error).toBe("string")
  })
})
