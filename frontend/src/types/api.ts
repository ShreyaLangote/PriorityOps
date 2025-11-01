// TypeScript types matching backend Pydantic models

export type Priority = "low" | "medium" | "high" | "critical";
export type Status = "open" | "in_progress" | "resolved" | "closed" | "escalated";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  department?: string;
  assignee?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  escalated_at?: string;
}

export interface TicketCreate {
  title: string;
  description: string;
  priority: Priority;
  department?: string;
  assignee?: string;
}

export interface TicketUpdate {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  department?: string;
  assignee?: string;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Analytics Types
export interface TicketStats {
  total_tickets: number;
  open_tickets: number;
  closed_tickets: number;
  high_priority_tickets: number;
}

export interface PriorityDistribution {
  priority: Priority;
  count: number;
}

export interface TrendData {
  date: string;
  tickets_created: number;
  tickets_closed: number;
}

export interface PerformanceMetrics {
  avg_resolution_time_hours: number;
  total_resolved_tickets: number;
  resolution_rate_percent: number;
}

// Agent Types
export interface AgentHealthCheck {
  agent_type: string;
  status: string;
  last_check: string;
  uptime_seconds?: number;
  total_processed: number;
  success_rate?: number;
  last_error?: string;
  error_count: number;
  avg_processing_time_ms?: number;
  status_message?: string;
}

// API Error Response
export interface APIError {
  detail: string;
  status_code?: number;
}