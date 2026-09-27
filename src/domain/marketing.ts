import type { Repository } from '../ports/index.js';
import {
  InvalidTransitionError,
  invariant,
  money,
  nonEmpty,
  type BrandId,
  type CampaignId,
  type ContentId,
  type ConversionEventId,
  type MarketingExperimentId,
  type MarketingPlanId,
  type MarketingSpendId,
  type Money,
  type PublicationId,
  type StrategyId,
  type TenantId
} from './shared.js';

export const marketingChannels = [
  'organic_social', 'paid_social', 'search', 'email', 'creator', 'partnership',
  'community', 'web', 'referral', 'other'
] as const;
export type MarketingChannel = typeof marketingChannels[number];

export const funnelStageNames = ['awareness', 'consideration', 'conversion', 'retention', 'advocacy'] as const;
export type FunnelStageName = typeof funnelStageNames[number];

export const conversionEventTypes = [
  'lead', 'qualified_lead', 'booking', 'signup', 'purchase', 'renewal', 'referral', 'custom'
] as const;
export type ConversionEventType = typeof conversionEventTypes[number];

export interface MarketingOffer {
  readonly name: string;
  readonly promise: string;
  readonly cta: string;
}

export interface AudienceSegment {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly need: string;
}

export interface FunnelStage {
  readonly stage: FunnelStageName;
  readonly objective: string;
  readonly cta: string;
  readonly channels: readonly MarketingChannel[];
}

export interface ConversionGoal {
  readonly name: string;
  readonly eventType: ConversionEventType;
  readonly target?: number;
  readonly value?: Money;
}

export type MarketingPlanStatus = 'draft' | 'active' | 'archived';
export interface MarketingPlan {
  readonly id: MarketingPlanId;
  readonly tenantId: TenantId;
  readonly brandId: BrandId;
  readonly strategyId: StrategyId;
  readonly name: string;
  readonly businessOutcome: string;
  readonly positioning: string;
  readonly offer: MarketingOffer;
  readonly audienceSegments: readonly AudienceSegment[];
  readonly funnelStages: readonly FunnelStage[];
  readonly conversionGoals: readonly ConversionGoal[];
  readonly campaignIds: readonly CampaignId[];
  readonly status: MarketingPlanStatus;
  readonly createdAt: string;
  readonly activatedAt?: string;
}

export function createMarketingPlan(input: MarketingPlan): MarketingPlan {
  nonEmpty(input.name, 'Marketing plan name');
  nonEmpty(input.businessOutcome, 'Marketing plan business outcome');
  nonEmpty(input.positioning, 'Marketing plan positioning');
  nonEmpty(input.offer.name, 'Marketing offer name');
  nonEmpty(input.offer.promise, 'Marketing offer promise');
  nonEmpty(input.offer.cta, 'Marketing offer CTA');
  invariant(input.audienceSegments.length > 0, 'Marketing plan needs an audience segment');
  invariant(input.funnelStages.length > 0, 'Marketing plan needs a funnel stage');
  invariant(input.conversionGoals.length > 0, 'Marketing plan needs a conversion goal');

  const segmentIds = new Set<string>();
  for (const segment of input.audienceSegments) {
    const id = nonEmpty(segment.id, 'Audience segment ID');
    invariant(!segmentIds.has(id), 'Audience segment IDs must be unique');
    segmentIds.add(id);
    nonEmpty(segment.name, 'Audience segment name');
    nonEmpty(segment.description, 'Audience segment description');
    nonEmpty(segment.need, 'Audience segment need');
  }

  const stages = new Set<FunnelStageName>();
  for (const stage of input.funnelStages) {
    invariant(funnelStageNames.includes(stage.stage), 'Funnel stage is not supported');
    invariant(!stages.has(stage.stage), 'Funnel stages must be unique');
    stages.add(stage.stage);
    nonEmpty(stage.objective, 'Funnel stage objective');
    nonEmpty(stage.cta, 'Funnel stage CTA');
    invariant(stage.channels.length > 0, 'Funnel stage needs a channel');
    invariant(stage.channels.every((channel) => marketingChannels.includes(channel)), 'Marketing channel is not supported');
  }

  const goalNames = new Set<string>();
  for (const goal of input.conversionGoals) {
    const name = nonEmpty(goal.name, 'Conversion goal name');
    invariant(!goalNames.has(name), 'Conversion goal names must be unique');
    goalNames.add(name);
    invariant(conversionEventTypes.includes(goal.eventType), 'Conversion event type is not supported');
    if (goal.target !== undefined) invariant(Number.isFinite(goal.target) && goal.target >= 0, 'Conversion goal target must be nonnegative and finite');
    if (goal.value !== undefined) {
      invariant(goal.value.amount >= 0, 'Conversion goal value cannot be negative');
      money(goal.value.amount, goal.value.currency);
    }
  }

  invariant(new Set(input.campaignIds).size === input.campaignIds.length, 'Linked campaigns must be unique');
  return structuredClone({
    ...input,
    conversionGoals: input.conversionGoals.map((goal) => goal.value === undefined
      ? goal
      : { ...goal, value: money(goal.value.amount, goal.value.currency) })
  });
}

export function activateMarketingPlan(plan: MarketingPlan, at: string): MarketingPlan {
  if (plan.status !== 'draft') throw new InvalidTransitionError(plan.status, 'active');
  return { ...plan, status: 'active', activatedAt: at };
}

export function linkCampaignToMarketingPlan(plan: MarketingPlan, campaignId: CampaignId): MarketingPlan {
  if (plan.campaignIds.includes(campaignId)) return structuredClone(plan);
  return { ...plan, campaignIds: [...plan.campaignIds, campaignId] };
}

export interface MarketingVariant {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export type MarketingExperimentStatus = 'draft' | 'running' | 'completed' | 'cancelled';
export interface MarketingExperiment {
  readonly id: MarketingExperimentId;
  readonly tenantId: TenantId;
  readonly marketingPlanId: MarketingPlanId;
  readonly campaignId?: CampaignId;
  readonly name: string;
  readonly hypothesis: string;
  readonly variants: readonly MarketingVariant[];
  readonly primaryMetric: string;
  readonly status: MarketingExperimentStatus;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly winnerVariantId?: string;
  readonly createdAt: string;
}

export function createMarketingExperiment(input: MarketingExperiment): MarketingExperiment {
  nonEmpty(input.name, 'Marketing experiment name');
  nonEmpty(input.hypothesis, 'Marketing experiment hypothesis');
  nonEmpty(input.primaryMetric, 'Marketing experiment primary metric');
  invariant(input.variants.length >= 2, 'Marketing experiment needs at least two variants');
  const variantIds = new Set<string>();
  for (const variant of input.variants) {
    const id = nonEmpty(variant.id, 'Marketing variant ID');
    invariant(!variantIds.has(id), 'Marketing variant IDs must be unique');
    variantIds.add(id);
    nonEmpty(variant.label, 'Marketing variant label');
    nonEmpty(variant.description, 'Marketing variant description');
  }
  if (input.winnerVariantId !== undefined) invariant(variantIds.has(input.winnerVariantId), 'Experiment winner must be one of its variants');
  return structuredClone(input);
}

export function startMarketingExperiment(experiment: MarketingExperiment, at: string): MarketingExperiment {
  if (experiment.status !== 'draft') throw new InvalidTransitionError(experiment.status, 'running');
  return { ...experiment, status: 'running', startedAt: at };
}

export function completeMarketingExperiment(experiment: MarketingExperiment, winnerVariantId: string, at: string): MarketingExperiment {
  if (experiment.status !== 'running') throw new InvalidTransitionError(experiment.status, 'completed');
  invariant(experiment.variants.some((variant) => variant.id === winnerVariantId), 'Experiment winner must be one of its variants');
  return { ...experiment, status: 'completed', completedAt: at, winnerVariantId };
}

export function cancelMarketingExperiment(experiment: MarketingExperiment, at: string): MarketingExperiment {
  invariant(experiment.status === 'draft' || experiment.status === 'running', 'Only draft or running experiments can be cancelled');
  return { ...experiment, status: 'cancelled', completedAt: at };
}

export interface ConversionEvent {
  readonly id: ConversionEventId;
  readonly tenantId: TenantId;
  readonly marketingPlanId: MarketingPlanId;
  readonly campaignId?: CampaignId;
  readonly contentId?: ContentId;
  readonly publicationId?: PublicationId;
  readonly eventType: ConversionEventType;
  readonly channel: MarketingChannel;
  readonly source: string;
  readonly value?: Money;
  readonly occurredAt: string;
  readonly metadata: Readonly<Record<string, string>>;
}

export function createConversionEvent(input: ConversionEvent): ConversionEvent {
  invariant(conversionEventTypes.includes(input.eventType), 'Conversion event type is not supported');
  invariant(marketingChannels.includes(input.channel), 'Marketing channel is not supported');
  nonEmpty(input.source, 'Conversion source');
  if (input.value !== undefined) {
    invariant(input.value.amount >= 0, 'Conversion value cannot be negative');
    return structuredClone({ ...input, value: money(input.value.amount, input.value.currency) });
  }
  return structuredClone(input);
}

export interface MarketingSpend {
  readonly id: MarketingSpendId;
  readonly tenantId: TenantId;
  readonly marketingPlanId: MarketingPlanId;
  readonly campaignId?: CampaignId;
  readonly channel: MarketingChannel;
  readonly amount: Money;
  readonly occurredAt: string;
  readonly note?: string;
}

export function createMarketingSpend(input: MarketingSpend): MarketingSpend {
  invariant(marketingChannels.includes(input.channel), 'Marketing channel is not supported');
  invariant(input.amount.amount > 0, 'Marketing spend amount must be positive');
  const normalizedAmount = money(input.amount.amount, input.amount.currency);
  if (input.note !== undefined) nonEmpty(input.note, 'Marketing spend note');
  return structuredClone({ ...input, amount: normalizedAmount });
}

export interface MarketingChannelSummary {
  readonly totalSpend: Money;
  readonly attributedValue: Money;
  readonly conversionCount: number;
  readonly leads: number;
  readonly qualifiedLeads: number;
  readonly purchases: number;
}

export interface MarketingSummary extends MarketingChannelSummary {
  readonly cac: Money | null;
  readonly roas: number | null;
  readonly channelBreakdown: Readonly<Partial<Record<MarketingChannel, MarketingChannelSummary>>>;
}

/**
 * Summarizes explicitly attributed records only. CAC uses purchases when present,
 * otherwise qualified leads, and rounds to the nearest minor currency unit.
 */
export function summarizeMarketing(
  plan: MarketingPlan,
  conversions: readonly ConversionEvent[],
  spend: readonly MarketingSpend[]
): MarketingSummary {
  invariant(conversions.every((event) => event.tenantId === plan.tenantId && event.marketingPlanId === plan.id), 'Conversions must belong to the summarized plan and tenant');
  invariant(spend.every((item) => item.tenantId === plan.tenantId && item.marketingPlanId === plan.id), 'Spend must belong to the summarized plan and tenant');

  const monetary = [
    ...spend.map((item) => item.amount),
    ...conversions.flatMap((event) => event.value === undefined ? [] : [event.value])
  ];
  const fallback = plan.conversionGoals.find((goal) => goal.value !== undefined)?.value;
  const currency = monetary[0]?.currency ?? fallback?.currency ?? 'USD';
  invariant(monetary.every((value) => value.currency === currency), 'Currencies must match');

  const channels = new Map<MarketingChannel, { spend: number; value: number; conversions: number; leads: number; qualified: number; purchases: number }>();
  const channel = (name: MarketingChannel) => {
    const existing = channels.get(name);
    if (existing !== undefined) return existing;
    const created = { spend: 0, value: 0, conversions: 0, leads: 0, qualified: 0, purchases: 0 };
    channels.set(name, created);
    return created;
  };

  let spendAmount = 0;
  for (const item of spend) {
    spendAmount += item.amount.amount;
    channel(item.channel).spend += item.amount.amount;
  }
  let attributedAmount = 0;
  let leads = 0;
  let qualifiedLeads = 0;
  let purchases = 0;
  for (const event of conversions) {
    const current = channel(event.channel);
    current.conversions += 1;
    if (event.value !== undefined) {
      attributedAmount += event.value.amount;
      current.value += event.value.amount;
    }
    if (event.eventType === 'lead') { leads += 1; current.leads += 1; }
    if (event.eventType === 'qualified_lead') { qualifiedLeads += 1; current.qualified += 1; }
    if (event.eventType === 'purchase') { purchases += 1; current.purchases += 1; }
  }

  const denominator = purchases > 0 ? purchases : qualifiedLeads;
  const toChannelSummary = (value: ReturnType<typeof channel>): MarketingChannelSummary => ({
    totalSpend: money(value.spend, currency),
    attributedValue: money(value.value, currency),
    conversionCount: value.conversions,
    leads: value.leads,
    qualifiedLeads: value.qualified,
    purchases: value.purchases
  });
  return {
    totalSpend: money(spendAmount, currency),
    attributedValue: money(attributedAmount, currency),
    conversionCount: conversions.length,
    leads,
    qualifiedLeads,
    purchases,
    cac: denominator === 0 ? null : money(Math.round(spendAmount / denominator), currency),
    roas: spendAmount === 0 ? null : attributedAmount / spendAmount,
    channelBreakdown: Object.fromEntries([...channels].map(([name, value]) => [name, toChannelSummary(value)]))
  };
}

export type MarketingPlanRepository = Repository<MarketingPlan>;
export type MarketingExperimentRepository = Repository<MarketingExperiment>;
export type ConversionEventRepository = Repository<ConversionEvent>;
export type MarketingSpendRepository = Repository<MarketingSpend>;
