import { invariant, nonEmpty, type CampaignId, type InsightId, type ObservationId, type StrategyId, type TenantId } from './shared.js';
import type { Repository } from '../ports/index.js';
import type { PerformanceObservation } from './analytics.js';

export type InsightStatus = 'proposed' | 'accepted' | 'rejected';
export interface Insight {
  readonly id: InsightId; readonly tenantId: TenantId; readonly strategyId: StrategyId; readonly campaignId: CampaignId;
  readonly observationIds: readonly ObservationId[]; readonly finding: string; readonly recommendation: string;
  readonly confidence: number; readonly status: InsightStatus; readonly createdAt: string; readonly decidedAt?: string;
}
export interface GeneratedInsight { readonly finding: string; readonly recommendation: string; readonly confidence: number }
export interface InsightGenerator { generate(observations: readonly PerformanceObservation[]): Promise<GeneratedInsight> }
export function createInsight(input: Insight): Insight {
  invariant(input.observationIds.length > 0, 'Insight needs supporting evidence');
  nonEmpty(input.finding, 'Finding'); nonEmpty(input.recommendation, 'Recommendation');
  invariant(input.confidence >= 0 && input.confidence <= 1, 'Confidence must be between zero and one');
  return structuredClone(input);
}
export function decideInsight(insight: Insight, status: 'accepted' | 'rejected', at: string): Insight {
  invariant(insight.status === 'proposed', 'Only proposed insights can be decided');
  return { ...insight, status, decidedAt: at };
}
export type InsightRepository = Repository<Insight>;
