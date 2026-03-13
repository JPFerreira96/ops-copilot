import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TicketAIPanel } from "@/components/tickets/ticket-ai-panel"
import {
    isTicketPriority,
    isTicketStatus,
    ticketPriorityLabels,
    ticketStatusBadgeClasses,
    ticketStatusLabels,
} from "@/lib/ticket-meta"
import prisma from "@/lib/prisma"
import { ArrowLeft, AlertCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function TicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: ticketId } = await params

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
    })

    if (!ticket) {
        notFound()
    }

    const tags = JSON.parse(ticket.tags) as string[]
    const status = isTicketStatus(ticket.status) ? ticket.status : "OPEN"
    const priority = isTicketPriority(ticket.priority) ? ticket.priority : "MEDIUM"

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Ticket #{ticket.id.slice(-6).toUpperCase()}
                    </h1>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Criado {format(new Date(ticket.createdAt), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
                <div className="space-y-6 md:col-span-2">
                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-950">
                        <h2 className="mb-4 text-xl font-bold">{ticket.title}</h2>
                        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-zinc-700 dark:prose-invert dark:text-zinc-300">
                            {ticket.description}
                        </div>

                        <div className="mt-8 flex items-center gap-2 border-t pt-4">
                            <span className="text-sm font-medium text-zinc-500">Tags:</span>
                            <div className="flex flex-wrap gap-2">
                                {tags.length > 0 ? (
                                    tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="font-normal">
                                            {tag}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-zinc-400">Nenhuma tag</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <TicketAIPanel ticketId={ticket.id} initialData={ticket} />
                </div>

                <div className="space-y-6 md:col-span-1">
                    <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-950">
                        <div>
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detalhes</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-sm text-zinc-500">Status</span>
                                    <Badge variant={status === "DONE" ? "outline" : "default"} className={ticketStatusBadgeClasses[status]}>
                                        {ticketStatusLabels[status]}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-sm text-zinc-500">Prioridade</span>
                                    <div className="flex items-center gap-1.5 text-sm font-medium">
                                        {priority === "HIGH" && <AlertCircle className="h-4 w-4 text-rose-500" />}
                                        <span
                                            className={
                                                priority === "HIGH"
                                                    ? "text-rose-600"
                                                    : priority === "MEDIUM"
                                                        ? "text-amber-600"
                                                        : "text-emerald-600"
                                            }
                                        >
                                            {ticketPriorityLabels[priority]}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-sm text-zinc-500">Atualizado em</span>
                                    <span className="text-sm font-medium">{format(new Date(ticket.updatedAt), "dd/MM/yyyy HH:mm")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
