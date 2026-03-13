import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ticketSchema } from "@/lib/validations/ticket";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const buscar = searchParams.get("buscar") || "";
    const status = searchParams.get("status"); // ex: "OPEN,IN_PROGRESS"
    const priority = searchParams.get("priority");
    const tagsStr = searchParams.get("tags");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const whereClause: Prisma.TicketWhereInput = {};

        if (buscar) {
            whereClause.OR = [
                { title: { contains: buscar } },
                { description: { contains: buscar } }
            ];
        }

        if (status) {
            whereClause.status = { in: status.split(",") };
        }

        if (priority) {
            whereClause.priority = priority;
        }

        // Tags são armazenadas como uma string JSON no SQLite, entao nao podemos usar `has` apenas com SQL.
        // Mas em um MVP com String[] isso poderia ser um hasSome ou hasEvery dependendo da necessidade.

        if (tagsStr) {
            const tags = tagsStr.split(",");
            // fallback para SQLite array JSON convertido em String
            if (tags.length > 0) {
                whereClause.AND = tags.map(t => ({ tags: { contains: `"${t}"` } }));
            }
        }

        const tickets = await prisma.ticket.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });

        const total = await prisma.ticket.count({ where: whereClause });

        return NextResponse.json({
            data: tickets.map(t => ({
                ...t,
                tags: JSON.parse(t.tags),
                aiNextSteps: t.aiNextSteps ? JSON.parse(t.aiNextSteps) : null,
                aiCategories: t.aiCategories ? JSON.parse(t.aiCategories) : null,
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch {
        return NextResponse.json(
            { message: "Falha em buscar tickets", code: "FETCH_ERROR" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = ticketSchema.parse(body);

        const ticket = await prisma.ticket.create({
            data: {
                title: validatedData.title,
                description: validatedData.description,
                status: validatedData.status,
                priority: validatedData.priority,
                tags: JSON.stringify(validatedData.tags), // SQLite fallback para String[]
            },
        });

        return NextResponse.json({
            ...ticket,
            tags: JSON.parse(ticket.tags)
        }, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { message: "Validation failed", code: "VALIDATION_ERROR", errors: error.issues },
                { status: 400 }
            );
        }

        const message = error instanceof Error ? error.message : "Failed to create ticket";
        return NextResponse.json(
            { message, code: "CREATE_ERROR" },
            { status: 500 }
        );
    }
}
