"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    isTicketPriorityFilter,
    isTicketStatusFilter,
    ticketPriorityFilterLabels,
    ticketPriorityOptions,
    TicketPriorityFilter,
    ticketStatusFilterLabels,
    ticketStatusOptions,
    TicketStatusFilter,
} from "@/lib/ticket-meta"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export function TicketFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
    const selectedStatus = getStatusFilter(searchParams.get("status"))
    const selectedPriority = getPriorityFilter(searchParams.get("priority"))

    useEffect(() => {
        const handler = setTimeout(() => {
            const current = new URLSearchParams(Array.from(searchParams.entries()))
            if (searchTerm) {
                current.set("q", searchTerm)
            } else {
                current.delete("q")
            }
            current.set("page", "1")
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
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <Input
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:max-w-sm"
            />

            <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue>{(value) => ticketStatusFilterLabels[getStatusFilter(value)]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">{ticketStatusFilterLabels.ALL}</SelectItem>
                    {ticketStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue>{(value) => ticketPriorityFilterLabels[getPriorityFilter(value)]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">{ticketPriorityFilterLabels.ALL}</SelectItem>
                    {ticketPriorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

function getStatusFilter(value: string | null): TicketStatusFilter {
    if (!value || !isTicketStatusFilter(value)) {
        return "ALL"
    }

    return value
}

function getPriorityFilter(value: string | null): TicketPriorityFilter {
    if (!value || !isTicketPriorityFilter(value)) {
        return "ALL"
    }

    return value
}
