"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TicketFormValues, ticketSchema } from "@/lib/validations/ticket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";

export default function NewTicketPage() {
    const router = useRouter();
    const [tagInput, setTagInput] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: "MEDIUM",
            status: "OPEN",
            tags: [],
        }
    });

    const tags = watch("tags") || [];

    const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag.length < 3 || newTag.length > 20) {
                toast.error("A tag deve ter entre 3 e 20 caracteres.");
                return;
            }
            if (tags.length >= 5) {
                toast.error("Máximo de 5 tags permitidas.");
                return;
            }
            if (tags.includes(newTag)) {
                toast.error("Esta tag já foi adicionada.");
                return;
            }
            setValue("tags", [...tags, newTag], { shouldValidate: true });
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setValue("tags", tags.filter((t: string) => t !== tagToRemove), { shouldValidate: true });
    };

    const onSubmit = async (data: any) => {
        setSubmitting(true);
        try {
            const response = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao criar ticket");
            }

            const createdTicket = await response.json();
            toast.success("Ticket criado com sucesso!");
            router.push(`/tickets/${createdTicket.id}`);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-6">
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
                            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                placeholder="Detalhes completos do incidente..."
                                className="min-h-[120px]"
                                {...register("description")}
                            />
                            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status Inicial</Label>
                                <Select defaultValue="OPEN" onValueChange={(val: any) => setValue("status", val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OPEN">Aberto</SelectItem>
                                        <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                                        <SelectItem value="DONE">Concluído</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Prioridade</Label>
                                <Select defaultValue="MEDIUM" onValueChange={(val: any) => setValue("priority", val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Prioridade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Baixa</SelectItem>
                                        <SelectItem value="MEDIUM">Média</SelectItem>
                                        <SelectItem value="HIGH">Alta</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.priority && <p className="text-red-500 text-sm">{errors.priority.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (pressione Enter para adicionar)</Label>
                            <Input
                                id="tags"
                                placeholder="ex: banco-de-dados, deploy, bug..."
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={addTag}
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map((tag: string) => (
                                    <span key={tag} className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 text-sm px-2 py-1 rounded">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="text-zinc-500 hover:text-red-500">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            {errors.tags && <p className="text-red-500 text-sm">{errors.tags.message}</p>}
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-4 border-t">
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
    );
}
