"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function TicketList({ tickets }: { tickets: any[] }) {
    const router = useRouter()

    if (!tickets || tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-dashed">
                <h3 className="text-lg font-semibold">Nenhum ticket encontrado</h3>
                <p className="text-sm text-muted-foreground mt-1">Crie um novo ticket ou altere os filtros.</p>
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
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => router.push(`/tickets/${ticket.id}`)}
                        >
                            <TableCell className="font-medium">{ticket.id.slice(-6).toUpperCase()}</TableCell>
                            <TableCell>
                                <Link href={`/tickets/${ticket.id}`} className="hover:underline line-clamp-1">
                                    {ticket.title}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <div className={`px-2 py-1 text-xs rounded-full inline-block ${ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                        ticket.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' :
                                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    }`}>
                                    {ticket.status === 'OPEN' ? 'ABERTO' : ticket.status === 'IN_PROGRESS' ? 'EM ANDAMENTO' : 'CONCLUÍDO'}
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className={`text-sm ${ticket.priority === 'HIGH' ? 'text-red-500 font-medium' :
                                        ticket.priority === 'MEDIUM' ? 'text-amber-500' : 'text-green-500'
                                    }`}>
                                    {ticket.priority}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1 flex-wrap max-w-[200px]">
                                    {Array.isArray(ticket.tags) && ticket.tags.map((tag: string) => (
                                        <span key={tag} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 text-[10px] rounded border">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground text-sm">
                                {format(new Date(ticket.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
