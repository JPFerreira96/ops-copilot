import { notFound } from "next/navigation"

import { TicketForm } from "@/components/tickets/ticket-form"
import prisma from "@/lib/prisma"

export default async function EditTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: ticketId } = await params

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  })

  if (!ticket) {
    notFound()
  }

  return (
    <TicketForm
      mode="edit"
      ticketId={ticket.id}
      initialValues={{
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        tags: ticket.tags,
      }}
    />
  )
}
