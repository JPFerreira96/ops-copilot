import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { TicketFilters } from "@/components/tickets/ticket-filters"
import { TicketList } from "@/components/tickets/ticket-list"
import { isTicketPriority, isTicketStatus } from "@/lib/ticket-meta"
import prisma from "@/lib/prisma"
import { Plus } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function Dashboard({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams

    const q = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined
    const statusParam = typeof resolvedParams.status === "string" ? resolvedParams.status : undefined
    const priorityParam = typeof resolvedParams.priority === "string" ? resolvedParams.priority : undefined

    const whereClause: {
        OR?: { title?: { contains: string }; description?: { contains: string } }[]
        status?: string
        priority?: string
    } = {}

    if (q) {
        whereClause.OR = [
            { title: { contains: q } },
            { description: { contains: q } },
        ]
    }

    if (statusParam && isTicketStatus(statusParam)) {
        whereClause.status = statusParam
    }

    if (priorityParam && isTicketPriority(priorityParam)) {
        whereClause.priority = priorityParam
    }

    const tickets = await prisma.ticket.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: 10,
    })

    const parsedTickets = tickets.map((ticket) => ({
        ...ticket,
        status: isTicketStatus(ticket.status) ? ticket.status : "OPEN",
        priority: isTicketPriority(ticket.priority) ? ticket.priority : "MEDIUM",
        tags: JSON.parse(ticket.tags) as string[],
    }))

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard de Tickets</h1>
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
                <CardContent>
                    <TicketList tickets={parsedTickets} />
                </CardContent>
            </Card>
        </div>
    )
}
