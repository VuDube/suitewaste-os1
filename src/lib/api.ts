import { QueryClient, useQuery, useMutation, UseQueryResult, UseMutationResult, QueryKey } from '@tanstack/react-query';
import { z } from 'zod';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  operationsRoutesSchema,
  complianceChecklistSchema,
  paymentsTransactionsSchema,
  marketplaceListingsSchema,
  trainingProgressSchema,
  leaderboardSchema,
  OperationsRoute,
  ComplianceItem,
  PaymentTransaction,
  MarketplaceListing,
  TrainingProgress,
  LeaderboardEntry,
  ImageClassificationResult,
  imageClassificationResultSchema,
} from './schemas';
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      staleTime: 5 * 60 * 1000,
    },
  },
});
const API_BASE_URL = '/api/v1';
async function apiFetch<T>(endpoint: string, schema: z.ZodSchema<T>, options: RequestInit = {}, queryKey: QueryKey): Promise<T> {
  const token = localStorage.getItem('sw_token');
  if (!navigator.onLine) {
    const cachedData = queryClient.getQueryData<T>(queryKey);
    if (cachedData) return cachedData;
    return schema.safeParse([]).success ? [] as T : {} as T;
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 401) {
    useAuthStore.getState().logout();
    throw new Error('Session expired. Please login again.');
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  const data = await response.json();
  return schema.parse(data.data);
}
export const useOperationsRoutes = (): UseQueryResult<OperationsRoute[], Error> =>
  useQuery({
    queryKey: ['routes'],
    queryFn: ({ queryKey }) => apiFetch('/operations/routes', operationsRoutesSchema, {}, queryKey),
  });
export const useComplianceChecklist = (): UseQueryResult<ComplianceItem[], Error> =>
  useQuery({
    queryKey: ['checklist'],
    queryFn: ({ queryKey }) => apiFetch('/compliance/checklist', complianceChecklistSchema, {}, queryKey),
  });
export const useUpdateChecklistItem = (): UseMutationResult<ComplianceItem, Error, { id: string; checked: boolean }> =>
  useMutation({
    mutationFn: (item) => apiFetch('/compliance/checklist', z.any(), { method: 'PUT', body: JSON.stringify(item) }, ['checklist']),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklist'] }),
  });
export const usePaymentsTransactions = (): UseQueryResult<PaymentTransaction[], Error> =>
  useQuery({
    queryKey: ['transactions'],
    queryFn: ({ queryKey }) => apiFetch('/payments/transactions', paymentsTransactionsSchema, {}, queryKey),
  });
export const useMarketplaceListings = (): UseQueryResult<MarketplaceListing[], Error> =>
  useQuery({
    queryKey: ['listings'],
    queryFn: ({ queryKey }) => apiFetch('/marketplace/listings', marketplaceListingsSchema, {}, queryKey),
  });
export const useTrainingProgress = (): UseQueryResult<TrainingProgress[], Error> =>
  useQuery({
    queryKey: ['trainingProgress'],
    queryFn: ({ queryKey }) => apiFetch('/training/progress', trainingProgressSchema, {}, queryKey),
  });
export const useTrainingLeaderboard = (): UseQueryResult<LeaderboardEntry[], Error> =>
  useQuery({
    queryKey: ['leaderboard'],
    queryFn: ({ queryKey }) => apiFetch('/training/leaderboard', leaderboardSchema, {}, queryKey),
  });