import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { TicketAIPanel } from "@/components/tickets/ticket-ai-panel";

export default async function TicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: ticketId } = await params;

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId }
    });

    if (!ticket) {
        notFound();
    }

    const tags = JSON.parse(ticket.tags);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Ticket #{ticket.id.slice(-6).toUpperCase()}</h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3.5 w-3.5" />
                        Criado {format(new Date(ticket.createdAt), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-950 border rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">{ticket.title}</h2>
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                            {ticket.description}
                        </div>

                        <div className="mt-8 flex items-center gap-2 border-t pt-4">
                            <span className="text-sm font-medium text-zinc-500">Tags:</span>
                            <div className="flex gap-2 flex-wrap">
                                {tags.length > 0 ? tags.map((t: string) => (
                                    <Badge key={t} variant="secondary" className="font-normal">{t}</Badge>
                                )) : <span className="text-sm text-zinc-400">Nenhuma tag</span>}
                            </div>
                        </div>
                    </div>

                    <TicketAIPanel ticketId={ticket.id} initialData={ticket} />
                </div>

                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-zinc-950 border rounded-xl p-6 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Detalhes</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-2 border-b">
                                    <span className="text-sm text-zinc-500">Status</span>
                                    <Badge variant={ticket.status === 'DONE' ? 'outline' : 'default'} className={
                                        ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                            ticket.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' :
                                                'bg-green-100 text-green-800 hover:bg-green-100 border-transparent'
                                    }>
                                        {ticket.status === 'OPEN' ? 'Aberto' : ticket.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Concluído'}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center pb-2 border-b">
                                    <span className="text-sm text-zinc-500">Prioridade</span>
                                    <div className="flex items-center gap-1.5 font-medium text-sm">
                                        {ticket.priority === 'HIGH' && <AlertCircle className="h-4 w-4 text-red-500" />}
                                        <span className={
                                            ticket.priority === 'HIGH' ? 'text-red-600' :
                                                ticket.priority === 'MEDIUM' ? 'text-amber-600' : 'text-green-600'
                                        }>
                                            {ticket.priority === 'HIGH' ? 'Alta' : ticket.priority === 'MEDIUM' ? 'Média' : 'Baixa'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pb-2 border-b">
                                    <span className="text-sm text-zinc-500">Atualizado em</span>
                                    <span className="text-sm font-medium">
                                        {format(new Date(ticket.updatedAt), "dd/MM/yyyy HH:mm")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
