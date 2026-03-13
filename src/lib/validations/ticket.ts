import { z } from 'zod';
import { ticketPriorityValues, ticketStatusValues } from "@/lib/ticket-meta";

export const ticketSchema = z.object({
    title: z.string().min(10, "Title must be at least 10 characters").max(150, "Title must be at most 150 characters"),
    description: z.string().min(30, "Description must be at least 30 characters"),
    priority: z.enum(ticketPriorityValues).default("MEDIUM"),
    status: z.enum(ticketStatusValues).default("OPEN"),
    tags: z.array(z.string().min(3, "Tag must be at least 3 characters").max(20, "Tag must be at most 20 characters"))
        .max(5, "Maximum of 5 tags allowed")
        .default([]),
});

export type TicketFormValues = z.infer<typeof ticketSchema>;
