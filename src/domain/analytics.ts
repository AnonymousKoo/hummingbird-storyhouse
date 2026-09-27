import { invariant, nonEmpty, type CampaignId, type ContentId, type ObservationId, type PublicationId, type StrategyId, type TenantId } from './shared.js';
import type { Repository } from '../ports/index.js';

export interface MetricValue { readonly name: string; readonly value: number; readonly unit: 'count' | 'ratio' | 'currency_minor' }
export interface PerformanceObservation {
  readonly id: ObservationId; readonly tenantId: TenantId; readonly publicationId: PublicationId;
  readonly contentId: ContentId; readonly campaignId: CampaignId; readonly strategyId: StrategyId;
  readonly windowStart: string; readonly windowEnd: string; readonly metrics: readonly MetricValue[]; readonly observedAt: string;
}
export interface KpiSnapshot { readonly strategyId: StrategyId; readonly asOf: string; readonly values: readonly MetricValue[] }
export function createObservation(input: PerformanceObservation): PerformanceObservation {
  invariant(input.metrics.length > 0, 'Observation needs metrics');
  invariant(new Date(input.windowStart) <= new Date(input.windowEnd), 'Metric window is out of order');
  input.metrics.forEach((metric) => { nonEmpty(metric.name, 'Metric name'); invariant(Number.isFinite(metric.value), 'Metric value must be finite'); });
  return structuredClone(input);
}
export type ObservationRepository = Repository<PerformanceObservation>;
