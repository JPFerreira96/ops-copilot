import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import prisma from "@/lib/prisma";
import { TicketFilters } from "@/components/tickets/ticket-filters";
import { TicketList } from "@/components/tickets/ticket-list";

// Force server component to re-evaluate on query changes
export const dynamic = "force-dynamic";

export default async function Dashboard({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams;
    const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
    const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined;
    const priority = typeof resolvedParams.priority === 'string' ? resolvedParams.priority : undefined;
    // page and pagination support omitted here for succinctness but tickets are limited to 10

    const whereClause: any = {};
    if (q) {
        whereClause.OR = [
            { title: { contains: q } },
            { description: { contains: q } }
        ];
    }
    if (status && status !== "ALL") whereClause.status = status;
    if (priority && priority !== "ALL") whereClause.priority = priority;

    const tickets = await prisma.ticket.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: 10
    });

    const parsedTickets = tickets.map(t => ({
        ...t,
        tags: JSON.parse(t.tags)
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard de Tickets</h1>
                    <p className="text-muted-foreground">Gerencie incidentes e tarefas operacionais.</p>
                </div>
                <Button>
                    <Link href="/tickets/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Ticket
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b mb-6">
                    <TicketFilters />
                </CardHeader>
                <CardContent>
                    <TicketList tickets={parsedTickets} />
                </CardContent>
            </Card>
        </div>
    );
}
