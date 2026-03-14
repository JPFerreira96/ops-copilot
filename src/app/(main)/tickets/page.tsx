import Link from "next/link"
import { Plus } from "lucide-react"
import { Prisma } from "@prisma/client"

import { TicketFilters } from "@/components/tickets/ticket-filters"
import { TicketList } from "@/components/tickets/ticket-list"
import { TicketsErrorState } from "@/components/tickets/tickets-error-state"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import prisma from "@/lib/prisma"
import { toTicketPriority, toTicketStatus } from "@/lib/ticket-meta"
import { ticketListQuerySchema } from "@/lib/validations/ticket"

export const dynamic = "force-dynamic"

type TicketsQuery = {
  search: string
  status?: string
  priority?: "low" | "medium" | "high"
  tags?: string
  page: number
  limit: number
}

type TicketsViewData = {
  query: TicketsQuery
  tickets: Awaited<ReturnType<typeof prisma.ticket.findMany>>
  total: number
  totalPages: number
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const rawSearchParams = await searchParams
  const normalizedParams = normalizeSearchParams(rawSearchParams)
  const data = await loadTicketsData(normalizedParams)

  if (!data) {
    return <TicketsErrorState message="Nao foi possivel carregar os tickets." />
  }

  const { query, tickets, total, totalPages } = data
  const hasPrevious = query.page > 1
  const hasNext = query.page < totalPages

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lista de Tickets</h1>
          <p className="text-muted-foreground">Gerencie incidentes e tarefas operacionais.</p>
        </div>

        <Link
          href="/tickets/new"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Novo Ticket
        </Link>
      </div>

      <Card>
        <CardHeader className="mb-6 border-b pb-3">
          <TicketFilters />
        </CardHeader>
        <CardContent className="space-y-4">
          <TicketList tickets={tickets} />

          <div className="flex items-center justify-between border-t pt-4 text-sm">
            <span className="text-muted-foreground">
              Pagina {query.page} de {totalPages} ({total} tickets)
            </span>

            <div className="flex gap-2">
              <Link
                className={`rounded-md border px-3 py-1 ${hasPrevious ? "hover:bg-muted" : "pointer-events-none opacity-40"}`}
                href={buildPageHref(query, query.page - 1)}
              >
                Anterior
              </Link>
              <Link
                className={`rounded-md border px-3 py-1 ${hasNext ? "hover:bg-muted" : "pointer-events-none opacity-40"}`}
                href={buildPageHref(query, query.page + 1)}
              >
                Proxima
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function loadTicketsData(rawParams: Record<string, string>): Promise<TicketsViewData | null> {
  try {
    const query = ticketListQuerySchema.parse(rawParams)

    const whereClause: Prisma.TicketWhereInput = {}

    if (query.search) {
      whereClause.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
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

    return {
      query,
      tickets,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    }
  } catch {
    return null
  }
}

function normalizeSearchParams(params: { [key: string]: string | string[] | undefined }) {
  const normalized: Record<string, string> = {}

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      normalized[key] = value
      continue
    }

    if (Array.isArray(value) && value.length > 0) {
      normalized[key] = value[0]
    }
  }

  return normalized
}

function buildPageHref(query: TicketsQuery, page: number) {
  const currentPage = Math.max(1, page)
  const params = new URLSearchParams()

  if (query.search) params.set("search", query.search)
  if (query.status) params.set("status", query.status)
  if (query.priority) params.set("priority", query.priority)
  if (query.tags) params.set("tags", query.tags)

  params.set("page", String(currentPage))
  params.set("limit", String(query.limit))

  return `/tickets?${params.toString()}`
}
