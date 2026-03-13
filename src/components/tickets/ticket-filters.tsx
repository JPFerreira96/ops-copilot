"use client"

import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TicketFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            const current = new URLSearchParams(Array.from(searchParams.entries()))
            if (searchTerm) {
                current.set("q", searchTerm)
            } else {
                current.delete("q")
            }
            current.set("page", "1") // reset to page 1 on search
            router.push(`/?${current.toString()}`)
        }, 300)

        return () => clearTimeout(handler)
    }, [searchTerm, router, searchParams])

    const handleStatusChange = (value: string | null) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()))
        if (value && value !== "ALL") {
            current.set("status", value)
        } else {
            current.delete("status")
        }
        current.set("page", "1")
        router.push(`/?${current.toString()}`)
    }

    const handlePriorityChange = (value: string | null) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()))
        if (value && value !== "ALL") {
            current.set("priority", value)
        } else {
            current.delete("priority")
        }
        current.set("page", "1")
        router.push(`/?${current.toString()}`)
    }

    return (
        <div className="flex flex-col gap-4 sm:flex-row mb-6">
            <Input
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
            />

            <Select
                defaultValue={searchParams.get("status") || "ALL"}
                onValueChange={handleStatusChange}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">Todos os Status</SelectItem>
                    <SelectItem value="OPEN">Aberto</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                    <SelectItem value="DONE">Concluído</SelectItem>
                </SelectContent>
            </Select>

            <Select
                defaultValue={searchParams.get("priority") || "ALL"}
                onValueChange={handlePriorityChange}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">Todas Prioridades</SelectItem>
                    <SelectItem value="LOW">Baixa</SelectItem>
                    <SelectItem value="MEDIUM">Média</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
