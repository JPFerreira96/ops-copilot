import Link from "next/link"
import { notFound } from "next/navigation"
import { AlertCircle, ArrowLeft, Clock, Pencil } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { isMockMode } from "@/lib/ai"
import {
  ticketPriorityLabels,
  ticketStatusBadgeClasses,
  ticketStatusLabels,
} from "@/lib/ticket-meta"
import prisma from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { TicketAIPanel } from "@/components/tickets/ticket-ai-panel"

export default async function TicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: ticketId } = await params

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  })

  if (!ticket) {
    notFound()
  }

  const mockMode = isMockMode()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/tickets"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Ticket #{ticket.id.slice(-6).toUpperCase()}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Criado {format(new Date(ticket.createdAt), "dd 'de' MMMM, yyyy 'as' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>

        <Link
          href={`/tickets/${ticket.id}/edit`}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-white px-3 text-sm font-medium transition-colors hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900"
        >
          <Pencil className="h-4 w-4" />
          Editar ticket
        </Link>
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
                {ticket.tags.length > 0 ? (
                  ticket.tags.map((tag) => (
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

          <TicketAIPanel ticketId={ticket.id} isMockMode={mockMode} />
        </div>

        <div className="space-y-6 md:col-span-1">
          <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-950">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detalhes</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-zinc-500">Status</span>
                  <Badge variant={ticket.status === "DONE" ? "outline" : "default"} className={ticketStatusBadgeClasses[ticket.status]}>
                    {ticketStatusLabels[ticket.status]}
                  </Badge>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-zinc-500">Prioridade</span>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    {ticket.priority === "HIGH" && <AlertCircle className="h-4 w-4 text-rose-500" />}
                    <span
                      className={
                        ticket.priority === "HIGH"
                          ? "text-rose-600"
                          : ticket.priority === "MEDIUM"
                            ? "text-amber-600"
                            : "text-emerald-600"
                      }
                    >
                      {ticketPriorityLabels[ticket.priority]}
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
