"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    ticketPriorityBadgeClasses,
    ticketPriorityLabels,
    TicketPriority,
    ticketStatusBadgeClasses,
    ticketStatusLabels,
    TicketStatus,
} from "@/lib/ticket-meta"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { useRouter } from "next/navigation"

type TicketListItem = {
    id: string
    title: string
    status: TicketStatus
    priority: TicketPriority
    tags: string[]
    createdAt: Date | string
}

export function TicketList({ tickets }: { tickets: TicketListItem[] }) {
    const router = useRouter()

    if (!tickets || tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-zinc-50 p-8 text-center dark:bg-zinc-900">
                <h3 className="text-lg font-semibold">Nenhum ticket encontrado</h3>
                <p className="mt-1 text-sm text-muted-foreground">Crie um novo ticket ou altere os filtros.</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead className="text-right">Criado em</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.map((ticket) => (
                        <TableRow
                            key={ticket.id}
                            className="cursor-pointer transition-colors hover:bg-muted/50"
                            onClick={() => router.push(`/tickets/${ticket.id}`)}
                        >
                            <TableCell className="font-medium">{ticket.id.slice(-6).toUpperCase()}</TableCell>
                            <TableCell>
                                <Link href={`/tickets/${ticket.id}`} className="line-clamp-1 hover:underline">
                                    {ticket.title}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Badge className={cn("font-medium", ticketStatusBadgeClasses[ticket.status])}>
                                    {ticketStatusLabels[ticket.status]}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={cn("font-medium", ticketPriorityBadgeClasses[ticket.priority])}>
                                    {ticketPriorityLabels[ticket.priority]}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex max-w-[220px] flex-wrap gap-1">
                                    {Array.isArray(ticket.tags) &&
                                        ticket.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="rounded border bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                </div>
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                                {format(new Date(ticket.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
