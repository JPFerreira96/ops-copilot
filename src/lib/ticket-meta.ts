export const ticketStatusValues = ["OPEN", "IN_PROGRESS", "DONE"] as const;
export type TicketStatus = (typeof ticketStatusValues)[number];

export const ticketPriorityValues = ["LOW", "MEDIUM", "HIGH"] as const;
export type TicketPriority = (typeof ticketPriorityValues)[number];

export type TicketStatusFilter = TicketStatus | "ALL";
export type TicketPriorityFilter = TicketPriority | "ALL";

export const ticketStatusLabels: Record<TicketStatus, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em andamento",
  DONE: "Concluído",
};

export const ticketPriorityLabels: Record<TicketPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
};

export const ticketStatusFilterLabels: Record<TicketStatusFilter, string> = {
  ALL: "Todos os status",
  ...ticketStatusLabels,
};

export const ticketPriorityFilterLabels: Record<TicketPriorityFilter, string> = {
  ALL: "Todas as prioridades",
  ...ticketPriorityLabels,
};

export const ticketStatusOptions = ticketStatusValues.map((value) => ({
  value,
  label: ticketStatusLabels[value],
}));

export const ticketPriorityOptions = ticketPriorityValues.map((value) => ({
  value,
  label: ticketPriorityLabels[value],
}));

export const ticketStatusBadgeClasses: Record<TicketStatus, string> = {
  OPEN: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  IN_PROGRESS: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  DONE: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-transparent",
};

export const ticketPriorityBadgeClasses: Record<TicketPriority, string> = {
  LOW: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-transparent",
  MEDIUM: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-transparent",
  HIGH: "bg-rose-100 text-rose-800 hover:bg-rose-100 border-transparent",
};

export function isTicketStatus(value: string): value is TicketStatus {
  return ticketStatusValues.includes(value as TicketStatus);
}

export function isTicketPriority(value: string): value is TicketPriority {
  return ticketPriorityValues.includes(value as TicketPriority);
}

export function isTicketStatusFilter(value: string): value is TicketStatusFilter {
  return value === "ALL" || isTicketStatus(value);
}

export function isTicketPriorityFilter(value: string): value is TicketPriorityFilter {
  return value === "ALL" || isTicketPriority(value);
}
