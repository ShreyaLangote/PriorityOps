// API Service Layer - Connected to FastAPI Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

import { 
  Ticket, 
  TicketCreate, 
  TicketUpdate, 
  TicketListResponse,
  TicketStats,
  PriorityDistribution,
  TrendData,
  PerformanceMetrics,
  Priority,
  Status,
  APIError
} from '@/types/api';

// HTTP Client Configuration
const fetchWithConfig = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error: APIError = await response.json().catch(() => ({
      detail: `HTTP ${response.status}: ${response.statusText}`,
      status_code: response.status,
    }));
    throw new Error(error.detail);
  }

  return response.json();
};

export const api = {
  // Ticket Management
  tickets: {
    // Get all tickets with filtering and pagination
    getAll: async (params?: {
      page?: number;
      per_page?: number;
      status?: Status;
      priority?: Priority;
      assignee?: string;
    }): Promise<TicketListResponse> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
      if (params?.status) searchParams.set('status', params.status);
      if (params?.priority) searchParams.set('priority', params.priority);
      if (params?.assignee) searchParams.set('assignee', params.assignee);

      const query = searchParams.toString();
      return fetchWithConfig(`/tickets${query ? `?${query}` : ''}`);
    },

    // Get single ticket by ID
    getById: async (id: string): Promise<Ticket> => {
      return fetchWithConfig(`/tickets/${id}`);
    },

    // Create new ticket
    create: async (data: TicketCreate): Promise<Ticket> => {
      return fetchWithConfig('/tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // Update existing ticket
    update: async (id: string, data: TicketUpdate): Promise<Ticket> => {
      return fetchWithConfig(`/tickets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    // Delete ticket
    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
      return fetchWithConfig(`/tickets/${id}`, {
        method: 'DELETE',
      });
    },

    // Get ticket audit trail
    getAuditTrail: async (id: string) => {
      return fetchWithConfig(`/tickets/${id}/audit`);
    },
  },

  // Analytics
  analytics: {
    // Get overall statistics
    getSummary: async (): Promise<TicketStats> => {
      return fetchWithConfig('/analytics/summary');
    },

    // Get priority distribution
    getPriorityDistribution: async (): Promise<PriorityDistribution[]> => {
      return fetchWithConfig('/analytics/priority');
    },

    // Get trend data
    getTrends: async (days: number = 30): Promise<TrendData[]> => {
      return fetchWithConfig(`/analytics/trends?days=${days}`);
    },

    // Get performance metrics
    getPerformanceMetrics: async (): Promise<PerformanceMetrics> => {
      return fetchWithConfig('/analytics/performance');
    },
  },

  // Health Check
  health: {
    check: async () => {
      return fetchWithConfig('/health', { 
        headers: { 'Content-Type': 'application/json' } 
      });
    },
  },

  // Legacy methods for backward compatibility
  submitTicket: async (data: TicketCreate) => {
    const ticket = await api.tickets.create(data);
    return {
      ticketId: ticket.id,
      estimatedResponse: '15-30 minutes',
      status: 'submitted'
    };
  },

  fetchTickets: async () => {
    return api.tickets.getAll();
  },

  // Mock AI suggestion (to be replaced with actual AI service)
  getAISuggestion: async (ticketId: string, description: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI thinking
    
    const suggestions = [
      {
        suggestion: "Check Exchange server connectivity and verify user credentials in Active Directory. Run 'Test-OutlookConnectivity' cmdlet to diagnose connection issues.",
        confidence: 87,
        category: "Email & Communication"
      },
      {
        suggestion: "Verify budget approval status and submit license request through Adobe Admin Console. Estimated processing time: 2-3 business days.",
        confidence: 92,
        category: "Software Licensing"
      },
      {
        suggestion: "Check access point firmware version (should be v4.2+) and analyze signal strength. Consider relocating AP or adding mesh extender.",
        confidence: 78,
        category: "Network Infrastructure"
      }
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  },

  // Mock alerts (to be replaced with actual monitoring service)
  getAlerts: async () => {
    return [
      {
        id: 'alert-001',
        severity: 'critical',
        message: 'Database Connection Timeout',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'alert-002',
        severity: 'warning',
        message: 'High Memory Usage on Server-03',
        timestamp: new Date().toISOString(),
      }
    ];
  }
};
