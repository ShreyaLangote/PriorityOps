import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { TicketCreate, TicketUpdate, Priority, Status } from '@/types/api';

// Query keys
export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...ticketKeys.lists(), filters] as const,
  details: () => [...ticketKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
};

// Hook for fetching tickets with filters
export const useTickets = (params?: {
  page?: number;
  per_page?: number;
  status?: Status;
  priority?: Priority;
  assignee?: string;
}) => {
  return useQuery({
    queryKey: ticketKeys.list(params || {}),
    queryFn: () => api.tickets.getAll(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
  });
};

// Hook for fetching single ticket
export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => api.tickets.getById(id),
    enabled: !!id,
  });
};

// Hook for creating tickets
export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TicketCreate) => api.tickets.create(data),
    onSuccess: () => {
      // Invalidate and refetch tickets list
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
};

// Hook for updating tickets
export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TicketUpdate }) => 
      api.tickets.update(id, data),
    onSuccess: (updatedTicket: { id: string }) => {
      // Update the specific ticket in cache
      queryClient.setQueryData(
        ticketKeys.detail(updatedTicket.id),
        updatedTicket
      );
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
};

// Hook for deleting tickets
export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.tickets.delete(id),
    onSuccess: (_: unknown, deletedId: string) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ticketKeys.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
};