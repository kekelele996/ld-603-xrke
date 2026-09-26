import type { HazardTicket } from "../types/HazardTicket";

export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

export const formatDay = (value?: string) => (value ? String(value).slice(0, 10) : "—");

export const formatHazardTicketNo = (ticket?: HazardTicket | null) =>
  ticket?.ticket_no || (ticket ? `YH-${String(ticket.id).padStart(4, "0")}` : "—");
