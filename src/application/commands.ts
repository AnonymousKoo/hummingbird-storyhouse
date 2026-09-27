import type { MetricValue } from '../domain/analytics.js';
import type { ApprovalRequest } from '../domain/approvals.js';
import type { Campaign } from '../domain/campaigns.js';
import type { Brand, BrandProfile } from '../domain/clients.js';
import type { Cost, CreatorPayout, Economics, Engagement, EngagementKind, ServicePackage } from '../domain/commerce.js';
import type { ContentItem, ProductionState } from '../domain/content.js';
import type { PublicationIntent, PublicationReceipt } from '../domain/distribution.js';
import type { Insight } from '../domain/learning.js';
import type { ConversionEvent, MarketingExperiment, MarketingPlan, MarketingSpend } from '../domain/marketing.js';
import type {
  ApprovalId,
  BrandId,
  CampaignId,
  CommandId,
  ContentId,
  Money,
  MarketingExperimentId,
  MarketingPlanId,
  ObservationId,
  PublicationId,
  StrategyId,
  TenantId
} from '../domain/shared.js';
import type { ChannelStrategy, KpiTarget, Strategy } from '../domain/strategy.js';
import type { PerformanceObservation } from '../domain/analytics.js';
import type { StoryhouseService } from './storyhouse.js';

interface CommandEnvelope<TType extends string, TPayload> {
  readonly commandId: CommandId;
  readonly tenantId: TenantId;
  readonly type: TType;
  readonly payload: TPayload;
}

export type StoryhouseCommand =
  | CommandEnvelope<'brand.onboard', { readonly organizationName: string; readonly name: string; readonly profile: BrandProfile }>
  | CommandEnvelope<'strategy.create', { readonly brandId: BrandId; readonly version: number; readonly goals: readonly string[]; readonly pillars: readonly string[]; readonly channels: readonly ChannelStrategy[]; readonly kpis: readonly KpiTarget[] }>
  | CommandEnvelope<'strategy.activate', { readonly strategyId: StrategyId }>
  | CommandEnvelope<'campaign.create', Omit<Campaign, 'id' | 'tenantId' | 'status' | 'createdAt'>>
  | CommandEnvelope<'content.create_brief', { readonly campaignId: CampaignId; readonly title: string; readonly idea: string; readonly hooks: readonly string[]; readonly brief: string; readonly cta: string; readonly metadata?: Readonly<Record<string, string>>; readonly parentId?: ContentId; readonly variantLabel?: string }>
  | CommandEnvelope<'content.advance', { readonly contentId: ContentId; readonly to: ProductionState }>
  | CommandEnvelope<'approval.request', { readonly contentId: ContentId; readonly requestedBy: string; readonly reviewer: string }>
  | CommandEnvelope<'approval.decide', { readonly approvalId: ApprovalId; readonly decision: 'approved' | 'revision_requested'; readonly actor: string; readonly note?: string }>
  | CommandEnvelope<'publication.schedule', { readonly contentId: ContentId; readonly channel: string; readonly scheduledAt: string; readonly variant?: Readonly<Record<string, string>> }>
  | CommandEnvelope<'publication.record_receipt', { readonly publicationId: PublicationId; readonly receipt: PublicationReceipt }>
  | CommandEnvelope<'analytics.ingest_metrics', { readonly publicationId: PublicationId; readonly windowStart: string; readonly windowEnd: string; readonly metrics: readonly MetricValue[] }>
  | CommandEnvelope<'learning.generate_insight', { readonly observationIds: readonly ObservationId[] }>
  | CommandEnvelope<'commerce.create_engagement', { readonly campaignIds: readonly CampaignId[]; readonly kind: EngagementKind; readonly package: ServicePackage; readonly contractedRevenue: Money; readonly costs: readonly Cost[]; readonly creatorPayouts: readonly CreatorPayout[]; readonly startsAt: string; readonly endsAt?: string }>
  | CommandEnvelope<'marketing.create_plan', Omit<MarketingPlan, 'id' | 'tenantId' | 'campaignIds' | 'status' | 'createdAt' | 'activatedAt'>>
  | CommandEnvelope<'marketing.activate_plan', { readonly marketingPlanId: MarketingPlanId }>
  | CommandEnvelope<'marketing.link_campaign', { readonly marketingPlanId: MarketingPlanId; readonly campaignId: CampaignId }>
  | CommandEnvelope<'marketing.create_experiment', Omit<MarketingExperiment, 'id' | 'tenantId' | 'status' | 'startedAt' | 'completedAt' | 'winnerVariantId' | 'createdAt'>>
  | CommandEnvelope<'marketing.start_experiment', { readonly marketingExperimentId: MarketingExperimentId }>
  | CommandEnvelope<'marketing.complete_experiment', { readonly marketingExperimentId: MarketingExperimentId; readonly winnerVariantId: string }>
  | CommandEnvelope<'marketing.record_conversion', Omit<ConversionEvent, 'id' | 'tenantId'>>
  | CommandEnvelope<'marketing.record_spend', Omit<MarketingSpend, 'id' | 'tenantId'>>;

export interface StoryhouseCommandResultMap {
  readonly 'brand.onboard': Brand;
  readonly 'strategy.create': Strategy;
  readonly 'strategy.activate': Strategy;
  readonly 'campaign.create': Campaign;
  readonly 'content.create_brief': ContentItem;
  readonly 'content.advance': ContentItem;
  readonly 'approval.request': ApprovalRequest;
  readonly 'approval.decide': ApprovalRequest;
  readonly 'publication.schedule': PublicationIntent;
  readonly 'publication.record_receipt': PublicationIntent;
  readonly 'analytics.ingest_metrics': PerformanceObservation;
  readonly 'learning.generate_insight': Insight;
  readonly 'commerce.create_engagement': { readonly engagement: Engagement; readonly economics: Economics };
  readonly 'marketing.create_plan': MarketingPlan;
  readonly 'marketing.activate_plan': MarketingPlan;
  readonly 'marketing.link_campaign': MarketingPlan;
  readonly 'marketing.create_experiment': MarketingExperiment;
  readonly 'marketing.start_experiment': MarketingExperiment;
  readonly 'marketing.complete_experiment': MarketingExperiment;
  readonly 'marketing.record_conversion': ConversionEvent;
  readonly 'marketing.record_spend': MarketingSpend;
}

export type StoryhouseCommandType = StoryhouseCommand['type'];
export type CommandOfType<TType extends StoryhouseCommandType> = Extract<StoryhouseCommand, { readonly type: TType }>;
export type CommandResult<TCommand extends StoryhouseCommand> = StoryhouseCommandResultMap[TCommand['type']];

export class StoryhouseCommandDispatcher {
  constructor(private readonly service: StoryhouseService) {}

  dispatch<TCommand extends StoryhouseCommand>(command: TCommand): Promise<CommandResult<TCommand>> {
    return this.dispatchCommand(command) as Promise<CommandResult<TCommand>>;
  }

  private dispatchCommand(command: StoryhouseCommand): Promise<StoryhouseCommandResultMap[StoryhouseCommandType]> {
    const { commandId, tenantId } = command;
    switch (command.type) {
      case 'brand.onboard': return this.service.onboardBrand(commandId, { tenantId, ...command.payload });
      case 'strategy.create': return this.service.createStrategy(commandId, { tenantId, ...command.payload });
      case 'strategy.activate': return this.service.activateStrategy(commandId, tenantId, command.payload.strategyId);
      case 'campaign.create': return this.service.createCampaign(commandId, { tenantId, ...command.payload });
      case 'content.create_brief': return this.service.createContentBrief(commandId, { tenantId, ...command.payload });
      case 'content.advance': return this.service.advanceContent(commandId, tenantId, command.payload.contentId, command.payload.to);
      case 'approval.request': return this.service.requestApproval(commandId, { tenantId, ...command.payload });
      case 'approval.decide': return this.service.decideApproval(commandId, { tenantId, ...command.payload });
      case 'publication.schedule': return this.service.schedulePublication(commandId, { tenantId, ...command.payload });
      case 'publication.record_receipt': return this.service.recordPublicationReceipt(commandId, tenantId, command.payload.publicationId, command.payload.receipt);
      case 'analytics.ingest_metrics': return this.service.ingestMetrics(commandId, { tenantId, ...command.payload });
      case 'learning.generate_insight': return this.service.generateInsight(commandId, tenantId, command.payload.observationIds);
      case 'commerce.create_engagement': return this.service.createEngagement(commandId, { tenantId, ...command.payload });
      case 'marketing.create_plan': return this.service.createMarketingPlan(commandId, { tenantId, ...command.payload });
      case 'marketing.activate_plan': return this.service.activateMarketingPlan(commandId, tenantId, command.payload.marketingPlanId);
      case 'marketing.link_campaign': return this.service.linkMarketingCampaign(commandId, tenantId, command.payload.marketingPlanId, command.payload.campaignId);
      case 'marketing.create_experiment': return this.service.createMarketingExperiment(commandId, { tenantId, ...command.payload });
      case 'marketing.start_experiment': return this.service.startMarketingExperiment(commandId, tenantId, command.payload.marketingExperimentId);
      case 'marketing.complete_experiment': return this.service.completeMarketingExperiment(commandId, tenantId, command.payload.marketingExperimentId, command.payload.winnerVariantId);
      case 'marketing.record_conversion': return this.service.recordConversion(commandId, { tenantId, ...command.payload });
      case 'marketing.record_spend': return this.service.recordMarketingSpend(commandId, { tenantId, ...command.payload });
    }
  }
}
