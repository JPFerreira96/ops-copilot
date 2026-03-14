import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().trim().email("Email invalido"),
  password: z.string().min(6, "Senha deve ter no minimo 6 caracteres"),
})

export type LoginFormValues = z.infer<typeof loginSchema>