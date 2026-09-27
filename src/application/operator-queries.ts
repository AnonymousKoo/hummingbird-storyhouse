import type { PerformanceObservation } from '../domain/analytics.js';
import type { ApprovalRequest } from '../domain/approvals.js';
import type { Campaign } from '../domain/campaigns.js';
import type { Brand } from '../domain/clients.js';
import { calculateEconomics, type Economics, type Engagement } from '../domain/commerce.js';
import { productionPath, type ContentItem, type ProductionState } from '../domain/content.js';
import type { PublicationIntent } from '../domain/distribution.js';
import type { Insight } from '../domain/learning.js';
import { summarizeMarketing, type ConversionEvent, type MarketingExperiment, type MarketingPlan, type MarketingSpend, type MarketingSummary } from '../domain/marketing.js';
import { NotFoundError, type MarketingPlanId, type Money, type TenantId } from '../domain/shared.js';
import type { Strategy } from '../domain/strategy.js';
import type { ActivityRepository, Clock, OutboxRecord, StoryhouseRepositories } from '../ports/index.js';

export interface BrandListItem {
  readonly brand: Brand;
  readonly activeStrategyCount: number;
  readonly campaignCount: number;
  readonly contentCount: number;
}

export interface BrandDetail extends BrandListItem {
  readonly strategies: readonly Strategy[];
  readonly campaigns: readonly Campaign[];
}

export interface CampaignListItem {
  readonly campaign: Campaign;
  readonly brandName: string;
  readonly strategyVersion: number;
  readonly contentCounts: Readonly<Partial<Record<ProductionState, number>>>;
}

export interface CampaignDetail extends CampaignListItem {
  readonly brand: Brand;
  readonly strategy: Strategy;
  readonly content: readonly ContentItem[];
  readonly engagements: readonly { readonly engagement: Engagement; readonly economics: Economics }[];
}

export interface ContentListItem {
  readonly content: ContentItem;
  readonly campaignName: string;
  readonly brandName: string;
  readonly approval?: ApprovalRequest;
  readonly publication?: PublicationIntent;
  readonly observationCount: number;
}

export interface ContentDetail extends ContentListItem {
  readonly campaign: Campaign;
  readonly brand: Brand;
  readonly approvals: readonly ApprovalRequest[];
  readonly publications: readonly PublicationIntent[];
  readonly observations: readonly PerformanceObservation[];
  readonly parent?: ContentItem;
  readonly variants: readonly ContentItem[];
  readonly nextState?: ProductionState;
}

export interface ApprovalListItem {
  readonly approval: ApprovalRequest;
  readonly content: ContentItem;
  readonly campaignName: string;
  readonly brandName: string;
}

export interface DistributionItem {
  readonly publication?: PublicationIntent;
  readonly content: ContentItem;
  readonly campaignName: string;
  readonly brandName: string;
}

export interface AnalyticsItem {
  readonly observation: PerformanceObservation;
  readonly contentTitle: string;
  readonly campaignName: string;
  readonly channel: string;
}

export interface AnalyticsSummary {
  readonly observations: readonly AnalyticsItem[];
  readonly totals: Readonly<Record<string, number>>;
  readonly publishedContent: readonly DistributionItem[];
}

export interface InsightListItem {
  readonly insight: Insight;
  readonly campaignName: string;
  readonly brandName: string;
  readonly observations: readonly PerformanceObservation[];
}

export interface CommerceItem {
  readonly engagement: Engagement;
  readonly economics: Economics;
  readonly campaignNames: readonly string[];
}

export interface CommerceSummary {
  readonly engagements: readonly CommerceItem[];
  readonly totals: Economics;
  readonly campaigns: readonly CampaignListItem[];
}

export interface MarketingPlanListItem {
  readonly plan: MarketingPlan;
  readonly brandName: string;
  readonly strategyVersion: number;
  readonly campaignCount: number;
}

export interface MarketingPlanDetail extends MarketingPlanListItem {
  readonly brand: Brand;
  readonly strategy: Strategy;
  readonly campaigns: readonly Campaign[];
}

export interface AttentionItem {
  readonly kind: 'approval' | 'review' | 'publication';
  readonly title: string;
  readonly detail: string;
  readonly href: string;
}

export interface OperatorDashboard {
  readonly counts: {
    readonly brands: number;
    readonly activeCampaigns: number;
    readonly contentInProduction: number;
    readonly pendingApprovals: number;
    readonly scheduledPublications: number;
  };
  readonly pipeline: Readonly<Record<ProductionState, number>>;
  readonly recentActivity: readonly OutboxRecord[];
  readonly performance: Readonly<Record<string, number>>;
  readonly economics: Economics;
  readonly attention: readonly AttentionItem[];
}

interface Snapshot {
  readonly brands: readonly Brand[];
  readonly strategies: readonly Strategy[];
  readonly campaigns: readonly Campaign[];
  readonly content: readonly ContentItem[];
  readonly approvals: readonly ApprovalRequest[];
  readonly publications: readonly PublicationIntent[];
  readonly observations: readonly PerformanceObservation[];
  readonly insights: readonly Insight[];
  readonly engagements: readonly Engagement[];
}

const byNewest = <T>(date: (item: T) => string) => (left: T, right: T): number => date(right).localeCompare(date(left));
const emptyMoney = (currency = 'USD'): Money => ({ amount: 0, currency });
const emptyEconomics = (): Economics => ({ revenue: emptyMoney(), costs: emptyMoney(), contributionMargin: emptyMoney(), marginRatio: 0 });

export class OperatorQueryService {
  constructor(
    private readonly repositories: StoryhouseRepositories,
    private readonly activity: ActivityRepository,
    private readonly clock: Clock
  ) {}

  async dashboard(tenantId: TenantId): Promise<OperatorDashboard> {
    const data = await this.snapshot(tenantId);
    const pipeline = this.pipeline(data.content);
    const economics = this.sumEconomics(data.engagements);
    const pending = data.approvals.filter((approval) => approval.status === 'pending');
    const activeCampaigns = data.campaigns.filter((campaign) => campaign.status === 'active');
    const inProduction = data.content.filter((item) => !['approved', 'scheduled', 'published'].includes(item.state));
    const performance = this.aggregateMetrics(data.observations);
    return {
      counts: {
        brands: data.brands.length,
        activeCampaigns: activeCampaigns.length,
        contentInProduction: inProduction.length,
        pendingApprovals: pending.length,
        scheduledPublications: data.publications.filter((item) => item.status === 'scheduled').length
      },
      pipeline,
      recentActivity: await this.activity.listRecent(tenantId, 8),
      performance,
      economics,
      attention: this.attention(data)
    };
  }

  async brands(tenantId: TenantId): Promise<readonly BrandListItem[]> {
    const data = await this.snapshot(tenantId);
    return data.brands.map((brand) => this.brandItem(brand, data)).sort((a, b) => a.brand.name.localeCompare(b.brand.name));
  }

  async brand(tenantId: TenantId, id: string): Promise<BrandDetail> {
    const data = await this.snapshot(tenantId);
    const brand = data.brands.find((item) => item.id === id);
    if (brand === undefined) throw new NotFoundError('Brand');
    return {
      ...this.brandItem(brand, data),
      strategies: data.strategies.filter((strategy) => strategy.brandId === brand.id).sort(byNewest((item) => item.createdAt)),
      campaigns: data.campaigns.filter((campaign) => campaign.brandId === brand.id).sort(byNewest((item) => item.createdAt))
    };
  }

  async campaigns(tenantId: TenantId): Promise<readonly CampaignListItem[]> {
    const data = await this.snapshot(tenantId);
    return data.campaigns.map((campaign) => this.campaignItem(campaign, data)).sort(byNewest((item) => item.campaign.createdAt));
  }

  async campaign(tenantId: TenantId, id: string): Promise<CampaignDetail> {
    const data = await this.snapshot(tenantId);
    const campaign = data.campaigns.find((item) => item.id === id);
    if (campaign === undefined) throw new NotFoundError('Campaign');
    const brand = data.brands.find((item) => item.id === campaign.brandId);
    const strategy = data.strategies.find((item) => item.id === campaign.strategyId);
    if (brand === undefined || strategy === undefined) throw new NotFoundError('Campaign relationship');
    return {
      ...this.campaignItem(campaign, data), brand, strategy,
      content: data.content.filter((item) => item.campaignId === campaign.id).sort(byNewest((item) => item.updatedAt)),
      engagements: data.engagements.filter((item) => item.campaignIds.includes(campaign.id)).map((engagement) => ({ engagement, economics: calculateEconomics(engagement, campaign.id) }))
    };
  }

  async content(tenantId: TenantId): Promise<readonly ContentListItem[]> {
    const data = await this.snapshot(tenantId);
    return data.content.map((content) => this.contentItem(content, data)).sort(byNewest((item) => item.content.updatedAt));
  }

  async contentDetail(tenantId: TenantId, id: string): Promise<ContentDetail> {
    const data = await this.snapshot(tenantId);
    const content = data.content.find((item) => item.id === id);
    if (content === undefined) throw new NotFoundError('Content');
    const campaign = data.campaigns.find((item) => item.id === content.campaignId);
    const brand = campaign === undefined ? undefined : data.brands.find((item) => item.id === campaign.brandId);
    if (campaign === undefined || brand === undefined) throw new NotFoundError('Content relationship');
    const index = productionPath.indexOf(content.state);
    const possibleNext = productionPath[index + 1];
    const nextState = possibleNext !== undefined && !['approved', 'scheduled', 'published'].includes(possibleNext) ? possibleNext : undefined;
    const parent = content.parentId === undefined ? undefined : data.content.find((item) => item.id === content.parentId);
    return {
      ...this.contentItem(content, data), campaign, brand,
      approvals: data.approvals.filter((item) => item.contentId === content.id).sort(byNewest((item) => item.createdAt)),
      publications: data.publications.filter((item) => item.contentId === content.id).sort(byNewest((item) => item.createdAt)),
      observations: data.observations.filter((item) => item.contentId === content.id).sort(byNewest((item) => item.observedAt)),
      ...(parent === undefined ? {} : { parent }),
      variants: data.content.filter((item) => item.parentId === content.id),
      ...(nextState === undefined ? {} : { nextState })
    };
  }

  async approvals(tenantId: TenantId, pendingOnly = true): Promise<readonly ApprovalListItem[]> {
    const data = await this.snapshot(tenantId);
    return data.approvals
      .filter((approval) => !pendingOnly || approval.status === 'pending')
      .map((approval) => this.approvalItem(approval, data))
      .sort(byNewest((item) => item.approval.createdAt));
  }

  async approval(tenantId: TenantId, id: string): Promise<ApprovalListItem> {
    const data = await this.snapshot(tenantId);
    const approval = data.approvals.find((item) => item.id === id);
    if (approval === undefined) throw new NotFoundError('Approval');
    return this.approvalItem(approval, data);
  }

  async distribution(tenantId: TenantId): Promise<readonly DistributionItem[]> {
    const data = await this.snapshot(tenantId);
    const eligible = data.content.filter((item) => ['approved', 'scheduled', 'published'].includes(item.state));
    return eligible.map((content) => {
      const item = this.contentItem(content, data);
      return { content, campaignName: item.campaignName, brandName: item.brandName, ...(item.publication === undefined ? {} : { publication: item.publication }) };
    }).sort(byNewest((item) => item.publication?.createdAt ?? item.content.updatedAt));
  }

  async analytics(tenantId: TenantId): Promise<AnalyticsSummary> {
    const data = await this.snapshot(tenantId);
    const totals = this.aggregateMetrics(data.observations);
    const observations = data.observations.map((observation) => {
      const content = data.content.find((item) => item.id === observation.contentId);
      const campaign = data.campaigns.find((item) => item.id === observation.campaignId);
      const publication = data.publications.find((item) => item.id === observation.publicationId);
      return { observation, contentTitle: content?.title ?? 'Unknown content', campaignName: campaign?.name ?? 'Unknown campaign', channel: publication?.channel ?? 'Unknown' };
    }).sort(byNewest((item) => item.observation.observedAt));
    const publishedContent = (await this.distribution(tenantId)).filter((item) => item.publication?.status === 'published');
    return { observations, totals, publishedContent };
  }

  async insights(tenantId: TenantId): Promise<readonly InsightListItem[]> {
    const data = await this.snapshot(tenantId);
    return data.insights.map((insight) => {
      const campaign = data.campaigns.find((item) => item.id === insight.campaignId);
      const brand = campaign === undefined ? undefined : data.brands.find((item) => item.id === campaign.brandId);
      return { insight, campaignName: campaign?.name ?? 'Unknown campaign', brandName: brand?.name ?? 'Unknown brand', observations: data.observations.filter((item) => insight.observationIds.includes(item.id)) };
    }).sort(byNewest((item) => item.insight.createdAt));
  }

  async commerce(tenantId: TenantId): Promise<CommerceSummary> {
    const data = await this.snapshot(tenantId);
    const campaigns = data.campaigns.map((campaign) => this.campaignItem(campaign, data));
    const engagements = data.engagements.map((engagement) => ({
      engagement,
      economics: calculateEconomics(engagement),
      campaignNames: engagement.campaignIds.map((id) => data.campaigns.find((item) => item.id === id)?.name ?? 'Unknown campaign')
    }));
    return { engagements, totals: this.sumEconomics(data.engagements), campaigns };
  }

  async marketingPlans(tenantId: TenantId): Promise<readonly MarketingPlanListItem[]> {
    const [plans, brands, strategies] = await Promise.all([
      this.repositories.marketingPlans.list(tenantId),
      this.repositories.brands.list(tenantId),
      this.repositories.strategies.list(tenantId)
    ]);
    return plans.map((plan) => ({
      plan,
      brandName: brands.find((brand) => brand.id === plan.brandId)?.name ?? 'Unknown brand',
      strategyVersion: strategies.find((strategy) => strategy.id === plan.strategyId)?.version ?? 0,
      campaignCount: plan.campaignIds.length
    })).sort(byNewest((item) => item.plan.createdAt));
  }

  async marketingPlan(tenantId: TenantId, id: MarketingPlanId): Promise<MarketingPlanDetail> {
    const plan = await this.repositories.marketingPlans.get(tenantId, id);
    if (plan === undefined) throw new NotFoundError('Marketing plan');
    const [brand, strategy, campaigns] = await Promise.all([
      this.repositories.brands.get(tenantId, plan.brandId),
      this.repositories.strategies.get(tenantId, plan.strategyId),
      this.repositories.campaigns.list(tenantId)
    ]);
    if (brand === undefined || strategy === undefined) throw new NotFoundError('Marketing plan relationship');
    const linkedCampaigns = campaigns.filter((campaign) => plan.campaignIds.includes(campaign.id));
    return { plan, brandName: brand.name, strategyVersion: strategy.version, campaignCount: linkedCampaigns.length, brand, strategy, campaigns: linkedCampaigns };
  }

  async marketingExperiments(tenantId: TenantId, marketingPlanId: MarketingPlanId): Promise<readonly MarketingExperiment[]> {
    await this.requireMarketingPlan(tenantId, marketingPlanId);
    return (await this.repositories.marketingExperiments.list(tenantId))
      .filter((experiment) => experiment.marketingPlanId === marketingPlanId)
      .sort(byNewest((experiment) => experiment.createdAt));
  }

  async marketingConversions(tenantId: TenantId, marketingPlanId: MarketingPlanId): Promise<readonly ConversionEvent[]> {
    await this.requireMarketingPlan(tenantId, marketingPlanId);
    return (await this.repositories.conversionEvents.list(tenantId))
      .filter((event) => event.marketingPlanId === marketingPlanId)
      .sort(byNewest((event) => event.occurredAt));
  }

  async marketingSpend(tenantId: TenantId, marketingPlanId: MarketingPlanId): Promise<readonly MarketingSpend[]> {
    await this.requireMarketingPlan(tenantId, marketingPlanId);
    return (await this.repositories.marketingSpend.list(tenantId))
      .filter((item) => item.marketingPlanId === marketingPlanId)
      .sort(byNewest((item) => item.occurredAt));
  }

  async marketingPerformance(tenantId: TenantId, marketingPlanId: MarketingPlanId): Promise<MarketingSummary> {
    const plan = await this.requireMarketingPlan(tenantId, marketingPlanId);
    const [conversions, spend] = await Promise.all([
      this.marketingConversions(tenantId, marketingPlanId),
      this.marketingSpend(tenantId, marketingPlanId)
    ]);
    return summarizeMarketing(plan, conversions, spend);
  }

  private async snapshot(tenantId: TenantId): Promise<Snapshot> {
    const [brands, strategies, campaigns, content, approvals, publications, observations, insights, engagements] = await Promise.all([
      this.repositories.brands.list(tenantId), this.repositories.strategies.list(tenantId), this.repositories.campaigns.list(tenantId),
      this.repositories.content.list(tenantId), this.repositories.approvals.list(tenantId), this.repositories.publications.list(tenantId),
      this.repositories.observations.list(tenantId), this.repositories.insights.list(tenantId), this.repositories.engagements.list(tenantId)
    ]);
    return { brands, strategies, campaigns, content, approvals, publications, observations, insights, engagements };
  }

  private async requireMarketingPlan(tenantId: TenantId, id: MarketingPlanId): Promise<MarketingPlan> {
    const plan = await this.repositories.marketingPlans.get(tenantId, id);
    if (plan === undefined) throw new NotFoundError('Marketing plan');
    return plan;
  }

  private brandItem(brand: Brand, data: Snapshot): BrandListItem {
    const campaigns = data.campaigns.filter((item) => item.brandId === brand.id);
    const campaignIds = new Set(campaigns.map((item) => item.id));
    return {
      brand,
      activeStrategyCount: data.strategies.filter((item) => item.brandId === brand.id && item.status === 'active').length,
      campaignCount: campaigns.length,
      contentCount: data.content.filter((item) => campaignIds.has(item.campaignId)).length
    };
  }

  private campaignItem(campaign: Campaign, data: Snapshot): CampaignListItem {
    const brand = data.brands.find((item) => item.id === campaign.brandId);
    const strategy = data.strategies.find((item) => item.id === campaign.strategyId);
    return { campaign, brandName: brand?.name ?? 'Unknown brand', strategyVersion: strategy?.version ?? 0, contentCounts: this.pipeline(data.content.filter((item) => item.campaignId === campaign.id)) };
  }

  private contentItem(content: ContentItem, data: Snapshot): ContentListItem {
    const campaign = data.campaigns.find((item) => item.id === content.campaignId);
    const brand = campaign === undefined ? undefined : data.brands.find((item) => item.id === campaign.brandId);
    const approvals = data.approvals.filter((item) => item.contentId === content.id).sort(byNewest((item) => item.createdAt));
    const publications = data.publications.filter((item) => item.contentId === content.id).sort(byNewest((item) => item.createdAt));
    const approval = approvals[0];
    const publication = publications[0];
    return {
      content,
      campaignName: campaign?.name ?? 'Unknown campaign',
      brandName: brand?.name ?? 'Unknown brand',
      ...(approval === undefined ? {} : { approval }),
      ...(publication === undefined ? {} : { publication }),
      observationCount: data.observations.filter((item) => item.contentId === content.id).length
    };
  }

  private approvalItem(approval: ApprovalRequest, data: Snapshot): ApprovalListItem {
    const content = data.content.find((item) => item.id === approval.contentId);
    if (content === undefined) throw new NotFoundError('Approval content');
    const related = this.contentItem(content, data);
    return { approval, content, campaignName: related.campaignName, brandName: related.brandName };
  }

  private pipeline(content: readonly ContentItem[]): Record<ProductionState, number> {
    const counts = Object.fromEntries(productionPath.map((state) => [state, 0])) as Record<ProductionState, number>;
    for (const item of content) counts[item.state] += 1;
    return counts;
  }

  private sumEconomics(engagements: readonly Engagement[]): Economics {
    if (engagements.length === 0) return emptyEconomics();
    const currency = engagements[0]?.contractedRevenue.currency ?? 'USD';
    let revenue = 0;
    let costs = 0;
    for (const engagement of engagements) {
      const item = calculateEconomics(engagement);
      if (item.revenue.currency !== currency) continue;
      revenue += item.revenue.amount;
      costs += item.costs.amount;
    }
    const margin = revenue - costs;
    return { revenue: { amount: revenue, currency }, costs: { amount: costs, currency }, contributionMargin: { amount: margin, currency }, marginRatio: revenue === 0 ? 0 : margin / revenue };
  }

  private aggregateMetrics(observations: readonly PerformanceObservation[]): Record<string, number> {
    const grouped = new Map<string, { total: number; count: number; unit: string }>();
    for (const metric of observations.flatMap((observation) => observation.metrics)) {
      const current = grouped.get(metric.name) ?? { total: 0, count: 0, unit: metric.unit };
      grouped.set(metric.name, { total: current.total + metric.value, count: current.count + 1, unit: metric.unit });
    }
    return Object.fromEntries([...grouped].map(([name, value]) => [name, value.unit === 'ratio' ? value.total / value.count : value.total]));
  }

  private attention(data: Snapshot): readonly AttentionItem[] {
    const pending = data.approvals.filter((item) => item.status === 'pending').map((approval) => {
      const content = data.content.find((item) => item.id === approval.contentId);
      return { kind: 'approval' as const, title: content?.title ?? 'Pending approval', detail: `Waiting on ${approval.reviewer}`, href: `/approvals/${approval.id}` };
    });
    const reviewWithoutRequest = data.content.filter((content) => content.state === 'review' && !data.approvals.some((approval) => approval.contentId === content.id && approval.status === 'pending')).map((content) => ({
      kind: 'review' as const, title: content.title, detail: 'In review with no pending approval request', href: `/content/${content.id}`
    }));
    const overdue = data.publications.filter((publication) => publication.status === 'scheduled' && new Date(publication.scheduledAt) < this.clock.now()).map((publication) => {
      const content = data.content.find((item) => item.id === publication.contentId);
      return { kind: 'publication' as const, title: content?.title ?? 'Scheduled publication', detail: 'Schedule has passed without a receipt', href: '/distribution' };
    });
    return [...pending, ...reviewWithoutRequest, ...overdue];
  }
}
