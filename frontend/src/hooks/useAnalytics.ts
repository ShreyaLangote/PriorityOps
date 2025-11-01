import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

// Query keys for analytics
export const analyticsKeys = {
  all: ['analytics'] as const,
  summary: () => [...analyticsKeys.all, 'summary'] as const,
  priority: () => [...analyticsKeys.all, 'priority'] as const,
  trends: (days: number) => [...analyticsKeys.all, 'trends', days] as const,
  performance: () => [...analyticsKeys.all, 'performance'] as const,
};

// Hook for ticket summary statistics
export const useTicketSummary = () => {
  return useQuery({
    queryKey: analyticsKeys.summary(),
    queryFn: () => api.analytics.getSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

// Hook for priority distribution
export const usePriorityDistribution = () => {
  return useQuery({
    queryKey: analyticsKeys.priority(),
    queryFn: () => api.analytics.getPriorityDistribution(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

// Hook for trend data
export const useTrendData = (days: number = 30) => {
  return useQuery({
    queryKey: analyticsKeys.trends(days),
    queryFn: () => api.analytics.getTrends(days),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Hook for performance metrics
export const usePerformanceMetrics = () => {
  return useQuery({
    queryKey: analyticsKeys.performance(),
    queryFn: () => api.analytics.getPerformanceMetrics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};