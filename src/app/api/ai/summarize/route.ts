import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai";
import prisma from "@/lib/prisma";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

export async function POST(request: NextRequest) {
    try {
        // 1. Checagem do rate limiting
        const ip = "127.0.0.1"; // request.ip nem sempre está disponível em ambientes de desenvolvimento local ou em implantações simples.
        const now = Date.now();
        const rateLimitData = rateLimitMap.get(ip);

        if (rateLimitData) {
            if (now < rateLimitData.resetTime) {
                if (rateLimitData.count >= MAX_REQUESTS) {
                    return NextResponse.json(
                        { message: "Too many requests, please try again later.", code: "RATE_LIMIT_EXCEEDED" },
                        { status: 429 }
                    );
                }
                rateLimitData.count += 1;
            } else {
                rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
            }
        } else {
            rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        }

        // 2. Processa o objeto do corpo da requisição
        const body = await request.json();
        const { ticketId } = body as { ticketId?: string };
        let { title, description } = body as { title?: string; description?: string };

        let ticket;

        if (ticketId) {
            ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
            if (!ticket) {
                return NextResponse.json(
                    { message: "Ticket not found", code: "NOT_FOUND" },
                    { status: 404 }
                );
            }

            // Cache check
            if (ticket.aiSummary && ticket.aiNextSteps && ticket.aiRiskLevel && ticket.aiCategories) {
                return NextResponse.json({
                    summary: ticket.aiSummary,
                    nextSteps: JSON.parse(ticket.aiNextSteps),
                    riskLevel: ticket.aiRiskLevel,
                    categories: JSON.parse(ticket.aiCategories)
                });
            }

            title = ticket.title;
            description = ticket.description;
        }

        if (!title || !description) {
            return NextResponse.json(
                { message: "Missing title or description", code: "BAD_REQUEST" },
                { status: 400 }
            );
        }

        // 3. Chamada para AI Provider
        const aiProvider = getAIProvider();
        const result = await aiProvider.generateSummary({ title, description });

        // 4. Salve no DB se for um ticket existente
        if (ticketId) {
            await prisma.ticket.update({
                where: { id: ticketId },
                data: {
                    aiSummary: result.summary,
                    aiNextSteps: JSON.stringify(result.nextSteps),
                    aiRiskLevel: result.riskLevel,
                    aiCategories: JSON.stringify(result.categories),
                }
            });
        }

        return NextResponse.json(result);

    } catch {
        return NextResponse.json(
            { message: "AI generation failed, try again.", code: "AI_ERROR" },
            { status: 500 }
        );
    }
}
