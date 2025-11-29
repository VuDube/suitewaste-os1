import { QueryClient, useQuery, useMutation, UseQueryResult, UseMutationResult, QueryKey } from '@tanstack/react-query';
import { z } from 'zod';
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
      retry: 2,
      refetchOnWindowFocus: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
const API_BASE_URL = '/api/v1';
// Generic fetcher with offline fallback
async function apiFetch<T>(endpoint: string, schema: z.ZodSchema<T>, options: RequestInit = {}, queryKey: QueryKey): Promise<T> {
  if (!navigator.onLine) {
    const cachedData = queryClient.getQueryData<T>(queryKey);
    if (cachedData) return cachedData;
    // For arrays, return empty array. For objects, this might need adjustment.
    return schema.safeParse([]).success ? [] as T : {} as T;
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  const data = await response.json();
  return schema.parse(data.data);
}
// Operations App
export const useOperationsRoutes = (): UseQueryResult<OperationsRoute[], Error> =>
  useQuery({
    queryKey: ['routes'],
    queryFn: ({ queryKey }) => apiFetch('/operations/routes', operationsRoutesSchema, {}, queryKey),
  });
export const useSuggestRoute = (): UseMutationResult<void, Error, { tasks: any[] }> =>
  useMutation({
    mutationFn: (data) => apiFetch('/operations/routes/suggest', z.void(), { method: 'POST', body: JSON.stringify(data) }, ['routes']),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  });
// Compliance App
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
export const useComplianceAudit = (): UseMutationResult<void, Error, void> =>
  useMutation({
    mutationFn: () => apiFetch('/compliance/audit', z.void(), { method: 'POST' }, ['checklist']),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklist'] }),
  });
// Payments App
export const usePaymentsTransactions = (): UseQueryResult<PaymentTransaction[], Error> =>
  useQuery({
    queryKey: ['transactions'],
    queryFn: ({ queryKey }) => apiFetch('/payments/transactions', paymentsTransactionsSchema, {}, queryKey),
  });
export const useCreatePayment = (): UseMutationResult<PaymentTransaction, Error, { recipient: string; amount: string }> =>
  useMutation({
    mutationFn: (payment) => apiFetch('/payments/transactions', z.any(), { method: 'POST', body: JSON.stringify(payment) }, ['transactions']),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });
// Marketplace App
export const useMarketplaceListings = (): UseQueryResult<MarketplaceListing[], Error> =>
  useQuery({
    queryKey: ['listings'],
    queryFn: ({ queryKey }) => apiFetch('/marketplace/listings', marketplaceListingsSchema, {}, queryKey),
  });
export const useClassifyImage = (): UseMutationResult<ImageClassificationResult, Error, { image: string }> =>
  useMutation({
    mutationFn: ({ image }) => apiFetch('/marketplace/classify', imageClassificationResultSchema, { method: 'POST', body: JSON.stringify({ image }) }, ['listings']),
  });
export const useCreateListing = (): UseMutationResult<MarketplaceListing, Error, FormData> =>
  useMutation({
    mutationFn: (formData) => {
      return fetch(`${API_BASE_URL}/marketplace/listings`, {
        method: 'POST',
        body: formData,
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to create listing');
        const data = await res.json();
        return marketplaceListingsSchema.parse([data.data])[0];
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listings'] }),
  });
// Training App
export const useTrainingProgress = (): UseQueryResult<TrainingProgress[], Error> =>
  useQuery({
    queryKey: ['trainingProgress'],
    queryFn: ({ queryKey }) => apiFetch('/training/progress', trainingProgressSchema, {}, queryKey),
  });
export const useUpdateProgress = (): UseMutationResult<TrainingProgress, Error, Partial<TrainingProgress> & { courseId: number }> =>
  useMutation({
    mutationFn: (progress) => apiFetch(`/training/progress/${progress.courseId}`, z.any(), { method: 'PUT', body: JSON.stringify(progress) }, ['trainingProgress']),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trainingProgress'] }),
  });
export const useTrainingLeaderboard = (): UseQueryResult<LeaderboardEntry[], Error> =>
  useQuery({
    queryKey: ['leaderboard'],
    queryFn: ({ queryKey }) => apiFetch('/training/leaderboard', leaderboardSchema, {}, queryKey),
  });