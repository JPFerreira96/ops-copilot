import { z } from "zod"

export const aiSummarizeInputSchema = z
  .object({
    ticketId: z.string().cuid().optional(),
    title: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    const hasTicketId = Boolean(data.ticketId)
    const hasManualPayload = Boolean(data.title && data.description)

    if (!hasTicketId && !hasManualPayload) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe ticketId ou title + description",
      })
    }
  })

export const aiResponseSchema = z
  .object({
    summary: z.string().min(1),
    nextSteps: z.array(z.string().min(1)).min(3).max(7),
    riskLevel: z.enum(["low", "medium", "high"]),
    categories: z.array(z.string().min(1)).min(1),
  })
  .superRefine((data, ctx) => {
    const lines = data.summary
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    if (lines.length < 3 || lines.length > 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Resumo deve ter entre 3 e 6 linhas",
        path: ["summary"],
      })
    }
  })

export type AISummarizeInput = z.infer<typeof aiSummarizeInputSchema>
export type AISummarizeOutput = z.infer<typeof aiResponseSchema>