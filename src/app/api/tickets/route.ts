import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { ticketSchema } from "@/lib/validations/ticket";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status"); // ex: "OPEN,IN_PROGRESS"
    const priority = searchParams.get("priority");
    const tagsStr = searchParams.get("tags");
    const cursor = searchParams.get("cursor"); // simple offset for now

    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const whereClause: any = {};

        if (q) {
            whereClause.OR = [
                { title: { contains: q } }, // SQLite search is case insensitive by default for some like operations, but might need adjustment
                { description: { contains: q } }
            ];
        }

        if (status) {
            whereClause.status = { in: status.split(",") };
        }

        if (priority) {
            whereClause.priority = priority;
        }

        // Since tags are stored as a JSON string in SQLite, exact match in array is hard via SQL alone, 
        // but in a real MVP with String[] this would be `hasSome`. For SQLite we can do a naive `contains` trick or fetch and filter
        if (tagsStr) {
            const tags = tagsStr.split(",");
            // Naive fallback for SQLite stringified JSON array
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
    } catch (error: any) {
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
                tags: JSON.stringify(validatedData.tags), // SQLite fallback for String[]
            },
        });

        return NextResponse.json({
            ...ticket,
            tags: JSON.parse(ticket.tags)
        }, { status: 201 });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return NextResponse.json(
                { message: "Validation failed", code: "VALIDATION_ERROR", errors: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: error.message || "Failed to create ticket", code: "CREATE_ERROR" },
            { status: 500 }
        );
    }
}
