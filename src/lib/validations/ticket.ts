import { z } from "zod"

import {
  ticketPriorityQueryValues,
  ticketPriorityValues,
  ticketStatusQueryValues,
  ticketStatusValues,
} from "@/lib/ticket-meta"

export const ticketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, "Titulo deve ter no minimo 10 caracteres")
    .max(150, "Titulo deve ter no maximo 150 caracteres"),
  description: z
    .string()
    .trim()
    .min(30, "Descricao deve ter no minimo 30 caracteres"),
  priority: z.enum(ticketPriorityValues).default("MEDIUM"),
  status: z.enum(ticketStatusValues).default("OPEN"),
  tags: z
    .array(z.string().trim().min(2, "Tag invalida").max(30, "Tag invalida"))
    .max(10, "Maximo de 10 tags")
    .default([]),
})

export const ticketUpdateSchema = ticketSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  })

export const ticketListQuerySchema = z.object({
  search: z.string().trim().optional().default(""),
  status: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => {
        if (!value) return true
        const values = value.split(",").map((item) => item.trim().toLowerCase())
        return values.every((item) => ticketStatusQueryValues.includes(item as (typeof ticketStatusQueryValues)[number]))
      },
      { message: "Status invalido" },
    ),
  priority: z.enum(ticketPriorityQueryValues).optional(),
  tags: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const ticketIdParamSchema = z.object({
  id: z.string().cuid("ID de ticket invalido"),
})

export type TicketFormValues = z.infer<typeof ticketSchema>
export type TicketFormInputValues = z.input<typeof ticketSchema>
