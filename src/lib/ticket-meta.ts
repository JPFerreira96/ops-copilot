import { Priority, Status } from "@prisma/client"

export const ticketStatusValues = [Status.OPEN, Status.IN_PROGRESS, Status.DONE] as const
export type TicketStatus = (typeof ticketStatusValues)[number]

export const ticketPriorityValues = [Priority.LOW, Priority.MEDIUM, Priority.HIGH] as const
export type TicketPriority = (typeof ticketPriorityValues)[number]

export const ticketStatusQueryValues = ["open", "in_progress", "done"] as const
export type TicketStatusQuery = (typeof ticketStatusQueryValues)[number]

export const ticketPriorityQueryValues = ["low", "medium", "high"] as const
export type TicketPriorityQuery = (typeof ticketPriorityQueryValues)[number]

export type TicketStatusFilter = TicketStatusQuery | "all"
export type TicketPriorityFilter = TicketPriorityQuery | "all"

export const ticketStatusLabels: Record<TicketStatus, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em andamento",
  DONE: "Concluido",
}

export const ticketPriorityLabels: Record<TicketPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Media",
  HIGH: "Alta",
}

export const ticketStatusFilterLabels: Record<TicketStatusFilter, string> = {
  all: "Todos os status",
  open: ticketStatusLabels.OPEN,
  in_progress: ticketStatusLabels.IN_PROGRESS,
  done: ticketStatusLabels.DONE,
}

export const ticketPriorityFilterLabels: Record<TicketPriorityFilter, string> = {
  all: "Todas as prioridades",
  low: ticketPriorityLabels.LOW,
  medium: ticketPriorityLabels.MEDIUM,
  high: ticketPriorityLabels.HIGH,
}

export const ticketStatusOptions = ticketStatusQueryValues.map((value) => ({
  value,
  label: ticketStatusFilterLabels[value],
}))

export const ticketPriorityOptions = ticketPriorityQueryValues.map((value) => ({
  value,
  label: ticketPriorityFilterLabels[value],
}))

export const ticketStatusFormOptions = ticketStatusValues.map((value) => ({
  value,
  label: ticketStatusLabels[value],
}))

export const ticketPriorityFormOptions = ticketPriorityValues.map((value) => ({
  value,
  label: ticketPriorityLabels[value],
}))

export const ticketStatusBadgeClasses: Record<TicketStatus, string> = {
  OPEN: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  IN_PROGRESS: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  DONE: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-transparent",
}

export const ticketPriorityBadgeClasses: Record<TicketPriority, string> = {
  LOW: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-transparent",
  MEDIUM: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-transparent",
  HIGH: "bg-rose-100 text-rose-800 hover:bg-rose-100 border-transparent",
}

const statusQueryToEnum: Record<TicketStatusQuery, TicketStatus> = {
  open: Status.OPEN,
  in_progress: Status.IN_PROGRESS,
  done: Status.DONE,
}

const priorityQueryToEnum: Record<TicketPriorityQuery, TicketPriority> = {
  low: Priority.LOW,
  medium: Priority.MEDIUM,
  high: Priority.HIGH,
}

const statusEnumToQuery: Record<TicketStatus, TicketStatusQuery> = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  DONE: "done",
}

const priorityEnumToQuery: Record<TicketPriority, TicketPriorityQuery> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
}

export function isTicketStatus(value: string): value is TicketStatus {
  return ticketStatusValues.includes(value as TicketStatus)
}

export function isTicketPriority(value: string): value is TicketPriority {
  return ticketPriorityValues.includes(value as TicketPriority)
}

export function isTicketStatusQuery(value: string): value is TicketStatusQuery {
  return ticketStatusQueryValues.includes(value as TicketStatusQuery)
}

export function isTicketPriorityQuery(value: string): value is TicketPriorityQuery {
  return ticketPriorityQueryValues.includes(value as TicketPriorityQuery)
}

export function toTicketStatus(value: string): TicketStatus | null {
  if (isTicketStatus(value)) {
    return value
  }

  if (isTicketStatusQuery(value)) {
    return statusQueryToEnum[value]
  }

  return null
}

export function toTicketPriority(value: string): TicketPriority | null {
  if (isTicketPriority(value)) {
    return value
  }

  if (isTicketPriorityQuery(value)) {
    return priorityQueryToEnum[value]
  }

  return null
}

export function toTicketStatusQuery(value: string): TicketStatusQuery | null {
  if (isTicketStatusQuery(value)) {
    return value
  }

  if (isTicketStatus(value)) {
    return statusEnumToQuery[value]
  }

  return null
}

export function toTicketPriorityQuery(value: string): TicketPriorityQuery | null {
  if (isTicketPriorityQuery(value)) {
    return value
  }

  if (isTicketPriority(value)) {
    return priorityEnumToQuery[value]
  }

  return null
}
