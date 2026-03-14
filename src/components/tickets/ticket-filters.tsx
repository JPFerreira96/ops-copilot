"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  isTicketPriorityQuery,
  isTicketStatusQuery,
  ticketPriorityOptions,
  type TicketPriorityFilter,
  ticketStatusOptions,
  type TicketStatusFilter,
} from "@/lib/ticket-meta"

const statusFilterLabelsPtBr: Record<TicketStatusFilter, string> = {
  all: "Todos os status",
  open: "Aberto",
  in_progress: "Em andamento",
  done: "Concluído",
}

const priorityFilterLabelsPtBr: Record<TicketPriorityFilter, string> = {
  all: "Todas as prioridades",
  low: "Baixa",
  medium: "Média",
  high: "Alta",
}

export function TicketFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [tagsTerm, setTagsTerm] = useState(searchParams.get("tags") || "")
  const selectedStatus = getStatusFilter(searchParams.get("status"))
  const selectedPriority = getPriorityFilter(searchParams.get("priority"))

  useEffect(() => {
    const handler = setTimeout(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))

      if (searchTerm.trim()) {
        current.set("search", searchTerm.trim())
      } else {
        current.delete("search")
      }

      if (tagsTerm.trim()) {
        current.set("tags", normalizeTags(tagsTerm))
      } else {
        current.delete("tags")
      }

      current.set("page", "1")
      router.push(`/tickets?${current.toString()}`)
    }, 350)

    return () => clearTimeout(handler)
  }, [searchTerm, tagsTerm, router, searchParams])

  const handleStatusChange = (value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))

    if (value && value !== "all") {
      current.set("status", value)
    } else {
      current.delete("status")
    }

    current.set("page", "1")
    router.push(`/tickets?${current.toString()}`)
  }

  const handlePriorityChange = (value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))

    if (value && value !== "all") {
      current.set("priority", value)
    } else {
      current.delete("priority")
    }

    current.set("page", "1")
    router.push(`/tickets?${current.toString()}`)
  }

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Input
        placeholder="Buscar por titulo ou descricao"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />

      <Input
        placeholder="Tags (ex: bug,incident)"
        value={tagsTerm}
        onChange={(event) => setTagsTerm(event.target.value)}
      />

      <Select value={selectedStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={statusFilterLabelsPtBr.all}>
            {statusFilterLabelsPtBr[selectedStatus]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{statusFilterLabelsPtBr.all}</SelectItem>
          {ticketStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {statusFilterLabelsPtBr[option.value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedPriority} onValueChange={handlePriorityChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={priorityFilterLabelsPtBr.all}>
            {priorityFilterLabelsPtBr[selectedPriority]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{priorityFilterLabelsPtBr.all}</SelectItem>
          {ticketPriorityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {priorityFilterLabelsPtBr[option.value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function normalizeTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(",")
}

function getStatusFilter(value: string | null): TicketStatusFilter {
  if (!value || !isTicketStatusQuery(value)) {
    return "all"
  }

  return value
}

function getPriorityFilter(value: string | null): TicketPriorityFilter {
  if (!value || !isTicketPriorityQuery(value)) {
    return "all"
  }

  return value
}
