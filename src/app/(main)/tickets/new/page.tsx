"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { KeyboardEvent } from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
    isTicketPriority,
    isTicketStatus,
    ticketPriorityFormOptions,
    ticketPriorityLabels,
    ticketStatusFormOptions,
    ticketStatusLabels,
} from "@/lib/ticket-meta"
import { TicketFormInputValues, ticketSchema } from "@/lib/validations/ticket"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function NewTicketPage() {
    const router = useRouter()
    const [tagInput, setTagInput] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<TicketFormInputValues>({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: "MEDIUM",
            status: "OPEN",
            tags: [],
        },
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
            toast.error("Esta tag já foi adicionada.")
            return
        }

        setValue("tags", [...tags, newTag], { shouldValidate: true })
        setTagInput("")
    }

    const removeTag = (tagToRemove: string) => {
        setValue(
            "tags",
            tags.filter((tag) => tag !== tagToRemove),
            { shouldValidate: true },
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
        setSubmitting(true)

        try {
            const response = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = (await response.json()) as { error?: string }
                throw new Error(errorData.error || "Erro ao criar ticket")
            }

            const createdTicket = (await response.json()) as { id: string }
            toast.success("Ticket criado com sucesso!")
            router.push(`/tickets/${createdTicket.id}`)
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message)
            } else {
                toast.error("Não foi possível criar o ticket")
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="mx-auto max-w-3xl py-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Novo Ticket</CardTitle>
                    <CardDescription>Registre um novo incidente ou tarefa operacional.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input id="title" placeholder="Descreva brevemente o problema..." {...register("title")} />
                            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
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
                                <Label htmlFor="status">Status inicial</Label>
                                <Select value={selectedStatus} onValueChange={handleStatusChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={getStatusLabel(selectedStatus)} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ticketStatusFormOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
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
                                        <SelectValue placeholder={getPriorityLabel(selectedPriority)} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ticketPriorityFormOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
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
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="text-zinc-500 hover:text-red-500"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            {errors.tags && <p className="text-sm text-red-500">{errors.tags.message}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-4 border-t pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Criando..." : "Criar Ticket"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

function getStatusLabel(value: string | null): string {
    if (value && isTicketStatus(value)) {
        return ticketStatusLabels[value]
    }

    return "Status"
}

function getPriorityLabel(value: string | null): string {
    if (value && isTicketPriority(value)) {
        return ticketPriorityLabels[value]
    }

    return "Prioridade"
}
