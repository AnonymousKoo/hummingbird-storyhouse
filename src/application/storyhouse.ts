import { createBrand, type Brand, type BrandProfile } from '../domain/clients.js';
import { activateStrategy as activate, createStrategy, type ChannelStrategy, type KpiTarget, type Strategy } from '../domain/strategy.js';
import { activateCampaign, createCampaign as makeCampaign, type Campaign } from '../domain/campaigns.js';
import { advanceContent as advance, createContent, returnContentForRevision, type ContentItem, type ProductionState } from '../domain/content.js';
import { createApproval, decideApproval, type ApprovalRequest } from '../domain/approvals.js';
import { createPublication, recordReceipt as publishReceipt, type PublicationIntent, type PublicationReceipt } from '../domain/distribution.js';
import { createObservation, type MetricValue, type PerformanceObservation } from '../domain/analytics.js';
import { createInsight, type Insight, type InsightGenerator } from '../domain/learning.js';
import { calculateEconomics, createEngagement as makeEngagement, type Cost, type CreatorPayout, type Economics, type Engagement, type EngagementKind, type ServicePackage } from '../domain/commerce.js';
import {
  activateMarketingPlan as activatePlan,
  completeMarketingExperiment as completeExperiment,
  createConversionEvent,
  createMarketingExperiment as makeExperiment,
  createMarketingPlan as makeMarketingPlan,
  createMarketingSpend as makeMarketingSpend,
  linkCampaignToMarketingPlan,
  startMarketingExperiment as startExperiment,
  type AudienceSegment,
  type ConversionEvent,
  type ConversionEventType,
  type ConversionGoal,
  type FunnelStage,
  type MarketingChannel,
  type MarketingExperiment,
  type MarketingOffer,
  type MarketingPlan,
  type MarketingSpend,
  type MarketingVariant
} from '../domain/marketing.js';
import { ConflictError, NotFoundError, invariant, iso, type ApprovalId, type BrandId, type CampaignId, type CommandId, type ContentId, type ConversionEventId, type DomainEvent, type EngagementId, type InsightId, type MarketingExperimentId, type MarketingPlanId, type MarketingSpendId, type Money, type ObservationId, type PublicationId, type StrategyId, type TenantId } from '../domain/shared.js';
import type { Clock, EventBus, IdGenerator, Repository, StoryhouseRepositories, TenantEntity } from '../ports/index.js';

export interface StoryhouseDependencies { readonly repositories: StoryhouseRepositories; readonly clock: Clock; readonly ids: IdGenerator; readonly events: EventBus; readonly insightGenerator: InsightGenerator }

export class StoryhouseService {
  readonly #commands = new Map<CommandId, Promise<unknown>>();
  constructor(private readonly deps: StoryhouseDependencies) {}

  onboardBrand(commandId: CommandId, input: { tenantId: TenantId; organizationName: string; name: string; profile: BrandProfile }): Promise<Brand> {
    return this.once(commandId, async () => {
      const brand = createBrand({ ...input, id: this.id('brand') as BrandId, createdAt: this.now() });
      await this.deps.repositories.brands.save(brand); await this.emit('brand.onboarded', brand, { name: brand.name }); return brand;
    });
  }

  createStrategy(commandId: CommandId, input: { tenantId: TenantId; brandId: BrandId; version: number; goals: readonly string[]; pillars: readonly string[]; channels: readonly ChannelStrategy[]; kpis: readonly KpiTarget[] }): Promise<Strategy> {
    return this.once(commandId, async () => {
      await this.mustGet(this.deps.repositories.brands, input.tenantId, input.brandId, 'Brand');
      const strategy = createStrategy({ ...input, id: this.id('strategy') as StrategyId, status: 'draft', createdAt: this.now() });
      await this.deps.repositories.strategies.save(strategy); await this.emit('strategy.created', strategy, { version: strategy.version }); return strategy;
    });
  }

  activateStrategy(commandId: CommandId, tenantId: TenantId, strategyId: StrategyId): Promise<Strategy> {
    return this.once(commandId, async () => {
      const current = await this.mustGet(this.deps.repositories.strategies, tenantId, strategyId, 'Strategy');
      const active = activate(current, this.now()); await this.deps.repositories.strategies.save(active);
      await this.emit('strategy.activated', active, { version: active.version }); return active;
    });
  }

  createCampaign(commandId: CommandId, input: Omit<Campaign, 'id' | 'status' | 'createdAt'>): Promise<Campaign> {
    return this.once(commandId, async () => {
      const strategy = await this.mustGet(this.deps.repositories.strategies, input.tenantId, input.strategyId, 'Strategy');
      invariant(strategy.status === 'active', 'Campaign requires an active strategy'); invariant(strategy.brandId === input.brandId, 'Campaign brand must match strategy brand');
      const campaign = activateCampaign(makeCampaign({ ...input, id: this.id('campaign') as CampaignId, status: 'draft', createdAt: this.now() }));
      await this.deps.repositories.campaigns.save(campaign); await this.emit('campaign.created', campaign, { name: campaign.name }); return campaign;
    });
  }

  createContentBrief(commandId: CommandId, input: { tenantId: TenantId; campaignId: CampaignId; title: string; idea: string; hooks: readonly string[]; brief: string; cta: string; metadata?: Readonly<Record<string, string>>; parentId?: ContentId; variantLabel?: string }): Promise<ContentItem> {
    return this.once(commandId, async () => {
      if (input.parentId !== undefined) await this.mustGet(this.deps.repositories.content, input.tenantId, input.parentId, 'Parent content');
      const campaign = await this.mustGet(this.deps.repositories.campaigns, input.tenantId, input.campaignId, 'Campaign'); invariant(campaign.status === 'active', 'Content requires an active campaign');
      const optional = { ...(input.parentId === undefined ? {} : { parentId: input.parentId }), ...(input.variantLabel === undefined ? {} : { variantLabel: input.variantLabel }) };
      const content = createContent({ ...input, ...optional, id: this.id('content') as ContentId, metadata: input.metadata ?? {}, state: 'brief', createdAt: this.now(), updatedAt: this.now() });
      await this.deps.repositories.content.save(content); await this.emit('content.brief_created', content, { title: content.title }); return content;
    });
  }

  advanceContent(commandId: CommandId, tenantId: TenantId, contentId: ContentId, to: ProductionState): Promise<ContentItem> {
    return this.once(commandId, async () => {
      invariant(to !== 'approved' && to !== 'scheduled' && to !== 'published', 'Approval, scheduling, and publication use their dedicated workflows');
      const content = await this.mustGet(this.deps.repositories.content, tenantId, contentId, 'Content');
      const updated = advance(content, to, this.now()); await this.deps.repositories.content.save(updated); await this.emit('content.advanced', updated, { from: content.state, to }); return updated;
    });
  }

  requestApproval(commandId: CommandId, input: { tenantId: TenantId; contentId: ContentId; requestedBy: string; reviewer: string }): Promise<ApprovalRequest> {
    return this.once(commandId, async () => {
      const content = await this.mustGet(this.deps.repositories.content, input.tenantId, input.contentId, 'Content'); invariant(content.state === 'review', 'Content must be in review');
      const existing = (await this.deps.repositories.approvals.list(input.tenantId)).find((item) => item.contentId === input.contentId && item.status === 'pending');
      if (existing !== undefined) throw new ConflictError('Content already has a pending review');
      const at = this.now(); const request = createApproval({ ...input, id: this.id('approval') as ApprovalId, status: 'pending', createdAt: at, history: [{ at, actor: input.requestedBy, action: 'requested' }] });
      await this.deps.repositories.approvals.save(request); await this.emit('approval.requested', request, { contentId: input.contentId }); return request;
    });
  }

  decideApproval(commandId: CommandId, input: { tenantId: TenantId; approvalId: ApprovalId; decision: 'approved' | 'revision_requested'; actor: string; note?: string }): Promise<ApprovalRequest> {
    return this.once(commandId, async () => {
      const request = await this.mustGet(this.deps.repositories.approvals, input.tenantId, input.approvalId, 'Approval');
      const decided = decideApproval(request, input.decision, input.actor, this.now(), input.note); await this.deps.repositories.approvals.save(decided);
      const content = await this.mustGet(this.deps.repositories.content, input.tenantId, request.contentId, 'Content');
      await this.deps.repositories.content.save(input.decision === 'approved' ? advance(content, 'approved', this.now()) : returnContentForRevision(content, this.now()));
      await this.emit(`approval.${input.decision}`, decided, { contentId: request.contentId }); return decided;
    });
  }

  schedulePublication(commandId: CommandId, input: { tenantId: TenantId; contentId: ContentId; channel: string; scheduledAt: string; variant?: Readonly<Record<string, string>> }): Promise<PublicationIntent> {
    return this.once(commandId, async () => {
      const content = await this.mustGet(this.deps.repositories.content, input.tenantId, input.contentId, 'Content'); invariant(content.state === 'approved', 'Only approved content can be scheduled');
      const approvals = await this.deps.repositories.approvals.list(input.tenantId); invariant(approvals.some((item) => item.contentId === input.contentId && item.status === 'approved'), 'An approved review is required');
      const publication = createPublication({ ...input, id: this.id('publication') as PublicationId, variant: input.variant ?? {}, status: 'scheduled', createdAt: this.now() });
      await this.deps.repositories.publications.save(publication); await this.deps.repositories.content.save(advance(content, 'scheduled', this.now())); await this.emit('publication.scheduled', publication, { channel: input.channel }); return publication;
    });
  }

  recordPublicationReceipt(commandId: CommandId, tenantId: TenantId, publicationId: PublicationId, receipt: PublicationReceipt): Promise<PublicationIntent> {
    return this.once(commandId, async () => {
      const intent = await this.mustGet(this.deps.repositories.publications, tenantId, publicationId, 'Publication'); const published = publishReceipt(intent, receipt);
      await this.deps.repositories.publications.save(published); const content = await this.mustGet(this.deps.repositories.content, tenantId, intent.contentId, 'Content'); await this.deps.repositories.content.save(advance(content, 'published', this.now()));
      await this.emit('publication.published', published, { externalId: receipt.externalId }); return published;
    });
  }

  ingestMetrics(commandId: CommandId, input: { tenantId: TenantId; publicationId: PublicationId; windowStart: string; windowEnd: string; metrics: readonly MetricValue[] }): Promise<PerformanceObservation> {
    return this.once(commandId, async () => {
      const publication = await this.mustGet(this.deps.repositories.publications, input.tenantId, input.publicationId, 'Publication'); invariant(publication.status === 'published', 'Metrics require a published publication');
      const content = await this.mustGet(this.deps.repositories.content, input.tenantId, publication.contentId, 'Content'); const campaign = await this.mustGet(this.deps.repositories.campaigns, input.tenantId, content.campaignId, 'Campaign');
      const observation = createObservation({ ...input, id: this.id('observation') as ObservationId, contentId: content.id, campaignId: campaign.id, strategyId: campaign.strategyId, observedAt: this.now() });
      await this.deps.repositories.observations.save(observation); await this.emit('analytics.observed', observation, { metricCount: observation.metrics.length }); return observation;
    });
  }

  generateInsight(commandId: CommandId, tenantId: TenantId, observationIds: readonly ObservationId[]): Promise<Insight> {
    return this.once(commandId, async () => {
      invariant(observationIds.length > 0, 'At least one observation is required');
      const observationsById = new Map<ObservationId, PerformanceObservation>();
      for (const id of [...new Set(observationIds)].sort()) {
        observationsById.set(id, await this.mustGet(this.deps.repositories.observations, tenantId, id, 'Observation'));
      }
      const observations = observationIds.map((id) => {
        const observation = observationsById.get(id);
        invariant(observation !== undefined, 'All insight observations must exist');
        return observation;
      });
      const first = observations[0]; invariant(first !== undefined, 'At least one observation is required'); invariant(observations.every((item) => item.strategyId === first.strategyId && item.campaignId === first.campaignId), 'Insight evidence must share a strategy and campaign');
      const generated = await this.deps.insightGenerator.generate(observations); const insight = createInsight({ ...generated, id: this.id('insight') as InsightId, tenantId, strategyId: first.strategyId, campaignId: first.campaignId, observationIds, status: 'proposed', createdAt: this.now() });
      await this.deps.repositories.insights.save(insight); await this.emit('learning.insight_generated', insight, { evidenceCount: observationIds.length }); return insight;
    });
  }

  createEngagement(commandId: CommandId, input: { tenantId: TenantId; campaignIds: readonly CampaignId[]; kind: EngagementKind; package: ServicePackage; contractedRevenue: Money; costs: readonly Cost[]; creatorPayouts: readonly CreatorPayout[]; startsAt: string; endsAt?: string }): Promise<{ engagement: Engagement; economics: Economics }> {
    return this.once(commandId, async () => {
      for (const id of [...new Set(input.campaignIds)].sort()) {
        await this.mustGet(this.deps.repositories.campaigns, input.tenantId, id, 'Campaign');
      }
      const engagement = makeEngagement({ ...input, id: this.id('engagement') as EngagementId }); await this.deps.repositories.engagements.save(engagement);
      const economics = calculateEconomics(engagement); await this.emit('commerce.engagement_created', engagement, { marginMinor: economics.contributionMargin.amount }); return { engagement, economics };
    });
  }

  createMarketingPlan(commandId: CommandId, input: { tenantId: TenantId; brandId: BrandId; strategyId: StrategyId; name: string; businessOutcome: string; positioning: string; offer: MarketingOffer; audienceSegments: readonly AudienceSegment[]; funnelStages: readonly FunnelStage[]; conversionGoals: readonly ConversionGoal[] }): Promise<MarketingPlan> {
    return this.once(commandId, async () => {
      await this.mustGet(this.deps.repositories.brands, input.tenantId, input.brandId, 'Brand');
      const strategy = await this.mustGet(this.deps.repositories.strategies, input.tenantId, input.strategyId, 'Strategy');
      invariant(strategy.brandId === input.brandId, 'Marketing plan brand must match strategy brand');
      const plan = makeMarketingPlan({ ...input, id: this.id('marketing_plan') as MarketingPlanId, campaignIds: [], status: 'draft', createdAt: this.now() });
      await this.deps.repositories.marketingPlans.save(plan);
      await this.emit('marketing.plan_created', plan, { name: plan.name, brandId: plan.brandId, strategyId: plan.strategyId });
      return plan;
    });
  }

  activateMarketingPlan(commandId: CommandId, tenantId: TenantId, marketingPlanId: MarketingPlanId): Promise<MarketingPlan> {
    return this.once(commandId, async () => {
      const plan = await this.mustGet(this.deps.repositories.marketingPlans, tenantId, marketingPlanId, 'Marketing plan');
      const strategy = await this.mustGet(this.deps.repositories.strategies, tenantId, plan.strategyId, 'Strategy');
      invariant(strategy.status === 'active', 'Marketing plan requires an active strategy before activation');
      const active = activatePlan(plan, this.now());
      await this.deps.repositories.marketingPlans.save(active);
      await this.emit('marketing.plan_activated', active, { status: active.status });
      return active;
    });
  }

  linkMarketingCampaign(commandId: CommandId, tenantId: TenantId, marketingPlanId: MarketingPlanId, campaignId: CampaignId): Promise<MarketingPlan> {
    return this.once(commandId, async () => {
      const plan = await this.mustGet(this.deps.repositories.marketingPlans, tenantId, marketingPlanId, 'Marketing plan');
      const campaign = await this.mustGet(this.deps.repositories.campaigns, tenantId, campaignId, 'Campaign');
      invariant(campaign.brandId === plan.brandId, 'Linked campaign brand must match marketing plan brand');
      invariant(campaign.strategyId === plan.strategyId, 'Linked campaign strategy must match marketing plan strategy');
      const linked = linkCampaignToMarketingPlan(plan, campaign.id);
      if (linked.campaignIds.length !== plan.campaignIds.length) {
        await this.deps.repositories.marketingPlans.save(linked);
        await this.emit('marketing.campaign_linked', linked, { campaignId });
      }
      return linked;
    });
  }

  createMarketingExperiment(commandId: CommandId, input: { tenantId: TenantId; marketingPlanId: MarketingPlanId; campaignId?: CampaignId; name: string; hypothesis: string; variants: readonly MarketingVariant[]; primaryMetric: string }): Promise<MarketingExperiment> {
    return this.once(commandId, async () => {
      const plan = await this.mustGet(this.deps.repositories.marketingPlans, input.tenantId, input.marketingPlanId, 'Marketing plan');
      if (input.campaignId !== undefined) {
        await this.mustGet(this.deps.repositories.campaigns, input.tenantId, input.campaignId, 'Campaign');
        invariant(plan.campaignIds.includes(input.campaignId), 'Experiment campaign must already be linked to the marketing plan');
      }
      const experiment = makeExperiment({ ...input, id: this.id('marketing_experiment') as MarketingExperimentId, status: 'draft', createdAt: this.now() });
      await this.deps.repositories.marketingExperiments.save(experiment);
      await this.emit('marketing.experiment_created', experiment, { marketingPlanId: plan.id, variantCount: experiment.variants.length });
      return experiment;
    });
  }

  startMarketingExperiment(commandId: CommandId, tenantId: TenantId, marketingExperimentId: MarketingExperimentId): Promise<MarketingExperiment> {
    return this.once(commandId, async () => {
      const experiment = await this.mustGet(this.deps.repositories.marketingExperiments, tenantId, marketingExperimentId, 'Marketing experiment');
      const plan = await this.mustGet(this.deps.repositories.marketingPlans, tenantId, experiment.marketingPlanId, 'Marketing plan');
      invariant(plan.status === 'active', 'Marketing experiment requires an active marketing plan');
      const running = startExperiment(experiment, this.now());
      await this.deps.repositories.marketingExperiments.save(running);
      await this.emit('marketing.experiment_started', running, { marketingPlanId: running.marketingPlanId });
      return running;
    });
  }

  completeMarketingExperiment(commandId: CommandId, tenantId: TenantId, marketingExperimentId: MarketingExperimentId, winnerVariantId: string): Promise<MarketingExperiment> {
    return this.once(commandId, async () => {
      const experiment = await this.mustGet(this.deps.repositories.marketingExperiments, tenantId, marketingExperimentId, 'Marketing experiment');
      const completed = completeExperiment(experiment, winnerVariantId, this.now());
      await this.deps.repositories.marketingExperiments.save(completed);
      await this.emit('marketing.experiment_completed', completed, { marketingPlanId: completed.marketingPlanId, winnerVariantId });
      return completed;
    });
  }

  recordConversion(commandId: CommandId, input: { tenantId: TenantId; marketingPlanId: MarketingPlanId; campaignId?: CampaignId; contentId?: ContentId; publicationId?: PublicationId; eventType: ConversionEventType; channel: MarketingChannel; source: string; value?: Money; occurredAt: string; metadata: Readonly<Record<string, string>> }): Promise<ConversionEvent> {
    return this.once(commandId, async () => {
      const plan = await this.mustGet(this.deps.repositories.marketingPlans, input.tenantId, input.marketingPlanId, 'Marketing plan');
      invariant(plan.status === 'active', 'Conversions require an active marketing plan');
      await this.validateMarketingReferences(plan, input);
      const conversion = createConversionEvent({ ...input, id: this.id('conversion') as ConversionEventId });
      await this.deps.repositories.conversionEvents.save(conversion);
      await this.emit('marketing.conversion_recorded', conversion, { marketingPlanId: plan.id, eventType: conversion.eventType, channel: conversion.channel });
      return conversion;
    });
  }

  recordMarketingSpend(commandId: CommandId, input: { tenantId: TenantId; marketingPlanId: MarketingPlanId; campaignId?: CampaignId; channel: MarketingChannel; amount: Money; occurredAt: string; note?: string }): Promise<MarketingSpend> {
    return this.once(commandId, async () => {
      const plan = await this.mustGet(this.deps.repositories.marketingPlans, input.tenantId, input.marketingPlanId, 'Marketing plan');
      invariant(plan.status === 'active', 'Marketing spend requires an active marketing plan');
      if (input.campaignId !== undefined) {
        await this.mustGet(this.deps.repositories.campaigns, input.tenantId, input.campaignId, 'Campaign');
        invariant(plan.campaignIds.includes(input.campaignId), 'Spend campaign must already be linked to the marketing plan');
      }
      const spend = makeMarketingSpend({ ...input, id: this.id('marketing_spend') as MarketingSpendId });
      await this.deps.repositories.marketingSpend.save(spend);
      await this.emit('marketing.spend_recorded', spend, { marketingPlanId: plan.id, channel: spend.channel, amount: spend.amount });
      return spend;
    });
  }

  private once<T>(commandId: CommandId, operation: () => Promise<T>): Promise<T> {
    const existing = this.#commands.get(commandId); if (existing !== undefined) return existing as Promise<T>;
    const running = operation().catch((error: unknown) => { this.#commands.delete(commandId); throw error; }); this.#commands.set(commandId, running); return running;
  }
  private async mustGet<T extends TenantEntity>(repository: Repository<T>, tenantId: TenantId, id: T['id'], kind: string): Promise<T> { const value = await repository.get(tenantId, id); if (value === undefined) throw new NotFoundError(kind); return value; }
  private id(prefix: string): string { return this.deps.ids.next(prefix); }
  private now(): string { return iso(this.deps.clock.now()); }
  private async validateMarketingReferences(plan: MarketingPlan, refs: { tenantId: TenantId; campaignId?: CampaignId; contentId?: ContentId; publicationId?: PublicationId }): Promise<void> {
    let relatedCampaignId: CampaignId | undefined;
    if (refs.campaignId !== undefined) {
      await this.mustGet(this.deps.repositories.campaigns, refs.tenantId, refs.campaignId, 'Campaign');
      relatedCampaignId = refs.campaignId;
    }
    if (refs.contentId !== undefined) {
      const content = await this.mustGet(this.deps.repositories.content, refs.tenantId, refs.contentId, 'Content');
      invariant(relatedCampaignId === undefined || relatedCampaignId === content.campaignId, 'Conversion content must belong to its campaign');
      relatedCampaignId = content.campaignId;
    }
    if (refs.publicationId !== undefined) {
      const publication = await this.mustGet(this.deps.repositories.publications, refs.tenantId, refs.publicationId, 'Publication');
      invariant(refs.contentId === undefined || refs.contentId === publication.contentId, 'Conversion publication must belong to its content');
      const content = await this.mustGet(this.deps.repositories.content, refs.tenantId, publication.contentId, 'Publication content');
      invariant(relatedCampaignId === undefined || relatedCampaignId === content.campaignId, 'Conversion publication must belong to its campaign');
      relatedCampaignId = content.campaignId;
    }
    if (relatedCampaignId !== undefined) invariant(plan.campaignIds.includes(relatedCampaignId), 'Conversion references must belong to a campaign linked to the marketing plan');
  }
  private async emit(type: string, aggregate: TenantEntity, payload: unknown): Promise<void> {
    const event: DomainEvent = { id: this.deps.ids.next('event'), type, tenantId: aggregate.tenantId, aggregateId: aggregate.id, occurredAt: this.now(), payload }; await this.deps.events.publish([event]);
  }
}
