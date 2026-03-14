"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { KeyboardEvent } from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  isTicketPriority,
  isTicketStatus,
  type TicketPriority,
  ticketPriorityFormOptions,
  type TicketStatus,
  ticketStatusFormOptions,
} from "@/lib/ticket-meta"
import { type TicketFormInputValues, ticketSchema } from "@/lib/validations/ticket"

const statusLabelsPtBr: Record<TicketStatus, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em andamento",
  DONE: "Concluido",
}

const priorityLabelsPtBr: Record<TicketPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Media",
  HIGH: "Alta",
}

type TicketFormMode = "create" | "edit"

type TicketFormProps = {
  mode: TicketFormMode
  ticketId?: string
  initialValues?: TicketFormInputValues
}

export function TicketForm({ mode, ticketId, initialValues }: TicketFormProps) {
  const router = useRouter()
  const [tagInput, setTagInput] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const isEditMode = mode === "edit"

  const defaultValues: TicketFormInputValues = {
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    priority: initialValues?.priority ?? "MEDIUM",
    status: initialValues?.status ?? "OPEN",
    tags: initialValues?.tags ?? [],
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TicketFormInputValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues,
  })

  const tags = watch("tags") || []
  const selectedStatus = watch("status") ?? "OPEN"
  const selectedPriority = watch("priority") ?? "MEDIUM"

  const addTag = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" && event.key !== ",") {
      return
    }

    event.preventDefault()
    const newTag = tagInput.trim()

    if (newTag.length < 2 || newTag.length > 30) {
      toast.error("A tag deve ter entre 2 e 30 caracteres.")
      return
    }

    if (tags.length >= 10) {
      toast.error("Maximo de 10 tags permitidas.")
      return
    }

    if (tags.includes(newTag)) {
      toast.error("Esta tag ja foi adicionada.")
      return
    }

    setValue("tags", [...tags, newTag], { shouldValidate: true, shouldDirty: true })
    setTagInput("")
  }

  const removeTag = (tagToRemove: string) => {
    setValue(
      "tags",
      tags.filter((tag) => tag !== tagToRemove),
      { shouldValidate: true, shouldDirty: true },
    )
  }

  const handleStatusChange = (value: string | null) => {
    if (!value || !isTicketStatus(value)) {
      return
    }

    setValue("status", value, { shouldValidate: true, shouldDirty: true })
  }

  const handlePriorityChange = (value: string | null) => {
    if (!value || !isTicketPriority(value)) {
      return
    }

    setValue("priority", value, { shouldValidate: true, shouldDirty: true })
  }

  const onSubmit = async (data: TicketFormInputValues) => {
    if (isEditMode && !ticketId) {
      toast.error("ID do ticket nao informado.")
      return
    }

    const requestUrl = isEditMode ? `/api/tickets/${ticketId}` : "/api/tickets"
    const method = isEditMode ? "PATCH" : "POST"
    const requestErrorMessage = isEditMode ? "Erro ao atualizar ticket" : "Erro ao criar ticket"

    setSubmitting(true)

    try {
      const response = await fetch(requestUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorMessage = await getErrorMessage(response, requestErrorMessage)
        throw new Error(errorMessage)
      }

      const ticket = (await response.json()) as { id: string }

      toast.success(isEditMode ? "Ticket atualizado com sucesso!" : "Ticket criado com sucesso!")
      router.push(`/tickets/${ticket.id}`)
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error(isEditMode ? "Nao foi possivel atualizar o ticket" : "Nao foi possivel criar o ticket")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const cancelPath = isEditMode && ticketId ? `/tickets/${ticketId}` : "/tickets"
  const title = isEditMode ? "Editar Ticket" : "Novo Ticket"
  const description = isEditMode
    ? "Atualize as informacoes do incidente ou tarefa operacional."
    : "Registre um novo incidente ou tarefa operacional."

  return (
    <div className="mx-auto max-w-3xl py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titulo</Label>
              <Input id="title" placeholder="Descreva brevemente o problema..." {...register("title")} />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Textarea
                id="description"
                placeholder="Detalhes completos do incidente..."
                className="min-h-[120px]"
                {...register("description")}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status">{getStatusLabel(selectedStatus)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ticketStatusFormOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {getStatusLabel(option.value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={selectedPriority} onValueChange={handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Prioridade">{getPriorityLabel(selectedPriority)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ticketPriorityFormOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {getPriorityLabel(option.value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.priority && <p className="text-sm text-red-500">{errors.priority.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (pressione Enter para adicionar)</Label>
              <Input
                id="tags"
                placeholder="ex: banco-de-dados, deploy, bug..."
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={addTag}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded bg-zinc-100 px-2 py-1 text-sm dark:bg-zinc-800"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-zinc-500 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              {errors.tags && <p className="text-sm text-red-500">{errors.tags.message}</p>}
            </div>

            <div className="flex items-center justify-end gap-4 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => router.push(cancelPath)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (isEditMode ? "Salvando..." : "Criando...") : isEditMode ? "Salvar alteracoes" : "Criar Ticket"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

async function getErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as { error?: string }
    return data.error ?? fallbackMessage
  } catch {
    return fallbackMessage
  }
}

function getStatusLabel(value: string | null): string {
  if (value && isTicketStatus(value)) {
    return statusLabelsPtBr[value]
  }

  return "Status"
}

function getPriorityLabel(value: string | null): string {
  if (value && isTicketPriority(value)) {
    return priorityLabelsPtBr[value]
  }

  return "Prioridade"
}
