import { z } from 'zod';
// Operations
export const operationsRouteSchema = z.object({
  id: z.string(),
  name: z.string(),
  positions: z.array(z.object({ lat: z.number(), lng: z.number() })),
});
export const operationsRoutesSchema = z.array(operationsRouteSchema);
export type OperationsRoute = z.infer<typeof operationsRouteSchema>;
// Compliance
export const complianceItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  checked: z.boolean(),
});
export const complianceChecklistSchema = z.array(complianceItemSchema);
export type ComplianceItem = z.infer<typeof complianceItemSchema>;
// Payments
export const paymentTransactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  amount: z.string(),
  status: z.enum(['Completed', 'Pending', 'Failed']),
});
export const paymentsTransactionsSchema = z.array(paymentTransactionSchema);
export type PaymentTransaction = z.infer<typeof paymentTransactionSchema>;
// Marketplace
export const marketplaceListingSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.string(),
  category: z.string(),
  image: z.string(),
});
export const marketplaceListingsSchema = z.array(marketplaceListingSchema);
export type MarketplaceListing = z.infer<typeof marketplaceListingSchema>;
export const imageClassificationResultSchema = z.object({
    name: z.string(),
    category: z.string(),
    estimatedPrice: z.string(),
});
export type ImageClassificationResult = z.infer<typeof imageClassificationResultSchema>;
// Training
export const trainingProgressSchema = z.array(z.object({
  id: z.number(),
  title: z.string(),
  duration: z.string(),
  completed: z.boolean(),
  started: z.boolean(),
  score: z.number().optional(),
  quiz: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.string(),
  })),
  badge: z.object({
    name: z.string(),
    color: z.string(),
  }),
}));
export type TrainingProgress = z.infer<typeof trainingProgressSchema>[0];
export const leaderboardEntrySchema = z.object({
  rank: z.number(),
  name: z.string(),
  points: z.number(),
  avatar: z.string(),
});
export const leaderboardSchema = z.array(leaderboardEntrySchema);
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;