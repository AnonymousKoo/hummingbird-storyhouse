import { describe, expect, it } from 'vitest';
import {
  activateMarketingPlan,
  completeMarketingExperiment,
  createMarketingExperiment,
  createMarketingPlan,
  linkCampaignToMarketingPlan,
  money,
  startMarketingExperiment,
  summarizeMarketing,
  type BrandId,
  type CampaignId,
  type ConversionEvent,
  type ConversionEventId,
  type MarketingExperiment,
  type MarketingExperimentId,
  type MarketingPlan,
  type MarketingPlanId,
  type MarketingSpend,
  type MarketingSpendId,
  type StrategyId
} from '../src/index.js';
import { tenantA } from './helpers.js';

const at = '2026-01-01T12:00:00.000Z';
const planId = 'marketing_plan_1' as MarketingPlanId;
const campaignId = 'campaign_1' as CampaignId;

function plan(overrides: Partial<MarketingPlan> = {}): MarketingPlan {
  return {
    id: planId,
    tenantId: tenantA,
    brandId: 'brand_1' as BrandId,
    strategyId: 'strategy_1' as StrategyId,
    name: 'Fictional field guide growth',
    businessOutcome: 'Increase qualified guide subscriptions',
    positioning: 'Practical fieldcraft for curious city makers',
    offer: { name: 'Field notes', promise: 'One useful field lesson each week', cta: 'Join the field list' },
    audienceSegments: [{ id: 'city_makers', name: 'City makers', description: 'Curious builders with limited space', need: 'Useful small-scale projects' }],
    funnelStages: [{ stage: 'conversion', objective: 'Earn qualified subscriptions', cta: 'Join the field list', channels: ['email', 'web'] }],
    conversionGoals: [{ name: 'Qualified subscriptions', eventType: 'qualified_lead', target: 40, value: money(2_500, 'USD') }],
    campaignIds: [],
    status: 'draft',
    createdAt: at,
    ...overrides
  };
}

function experiment(overrides: Partial<MarketingExperiment> = {}): MarketingExperiment {
  return {
    id: 'marketing_experiment_1' as MarketingExperimentId,
    tenantId: tenantA,
    marketingPlanId: planId,
    name: 'Fictional CTA framing',
    hypothesis: 'A utility-led CTA will earn more qualified subscriptions',
    variants: [
      { id: 'utility', label: 'Utility', description: 'Lead with the weekly lesson' },
      { id: 'community', label: 'Community', description: 'Lead with fellow makers' }
    ],
    primaryMetric: 'qualified_lead_rate',
    status: 'draft',
    createdAt: at,
    ...overrides
  };
}

describe('marketing domain', () => {
  it('enforces plan completeness and unique segment, stage, and goal identities', () => {
    expect(createMarketingPlan(plan())).toEqual(plan());
    expect(() => createMarketingPlan(plan({ businessOutcome: ' ' }))).toThrow('business outcome');
    expect(() => createMarketingPlan(plan({ audienceSegments: [] }))).toThrow('audience segment');
    expect(() => createMarketingPlan(plan({ funnelStages: [] }))).toThrow('funnel stage');
    expect(() => createMarketingPlan(plan({ conversionGoals: [] }))).toThrow('conversion goal');
    const segment = plan().audienceSegments[0];
    const stage = plan().funnelStages[0];
    const goal = plan().conversionGoals[0];
    expect(segment).toBeDefined(); expect(stage).toBeDefined(); expect(goal).toBeDefined();
    if (segment === undefined || stage === undefined || goal === undefined) throw new Error('Expected fixtures');
    expect(() => createMarketingPlan(plan({ audienceSegments: [segment, segment] }))).toThrow('segment IDs');
    expect(() => createMarketingPlan(plan({ funnelStages: [stage, stage] }))).toThrow('stages must be unique');
    expect(() => createMarketingPlan(plan({ conversionGoals: [goal, goal] }))).toThrow('goal names');
  });

  it('activates only drafts and links campaigns idempotently', () => {
    const active = activateMarketingPlan(createMarketingPlan(plan()), '2026-01-02T12:00:00.000Z');
    expect(active).toMatchObject({ status: 'active', activatedAt: '2026-01-02T12:00:00.000Z' });
    expect(() => activateMarketingPlan(active, '2026-01-03T12:00:00.000Z')).toThrow('Cannot transition');
    const linked = linkCampaignToMarketingPlan(active, campaignId);
    expect(linkCampaignToMarketingPlan(linked, campaignId).campaignIds).toEqual([campaignId]);
  });

  it('requires valid experiment transitions and a declared winner', () => {
    expect(() => createMarketingExperiment(experiment({ variants: [{ id: 'only', label: 'Only', description: 'Only variant' }] }))).toThrow('at least two');
    const running = startMarketingExperiment(createMarketingExperiment(experiment()), '2026-01-02T12:00:00.000Z');
    expect(() => completeMarketingExperiment(running, 'missing', '2026-01-03T12:00:00.000Z')).toThrow('winner');
    const completed = completeMarketingExperiment(running, 'utility', '2026-01-03T12:00:00.000Z');
    expect(completed).toMatchObject({ status: 'completed', winnerVariantId: 'utility' });
    expect(() => startMarketingExperiment(completed, '2026-01-04T12:00:00.000Z')).toThrow('Cannot transition');
  });

  it('summarizes explicit attribution by channel with purchase-first CAC', () => {
    const activePlan = createMarketingPlan(plan());
    const conversions: ConversionEvent[] = [
      { id: 'conversion_1' as ConversionEventId, tenantId: tenantA, marketingPlanId: planId, eventType: 'lead', channel: 'organic_social', source: 'fictional-field-post', occurredAt: at, metadata: {} },
      { id: 'conversion_2' as ConversionEventId, tenantId: tenantA, marketingPlanId: planId, eventType: 'qualified_lead', channel: 'email', source: 'fictional-field-letter', occurredAt: at, metadata: {} },
      { id: 'conversion_3' as ConversionEventId, tenantId: tenantA, marketingPlanId: planId, eventType: 'purchase', channel: 'email', source: 'fictional-field-letter', value: money(30_000, 'USD'), occurredAt: at, metadata: {} },
      { id: 'conversion_4' as ConversionEventId, tenantId: tenantA, marketingPlanId: planId, eventType: 'purchase', channel: 'search', source: 'fictional-field-search', value: money(20_000, 'USD'), occurredAt: at, metadata: {} }
    ];
    const spend: MarketingSpend[] = [
      { id: 'spend_1' as MarketingSpendId, tenantId: tenantA, marketingPlanId: planId, channel: 'email', amount: money(12_000, 'USD'), occurredAt: at },
      { id: 'spend_2' as MarketingSpendId, tenantId: tenantA, marketingPlanId: planId, channel: 'search', amount: money(8_000, 'USD'), occurredAt: at }
    ];
    expect(summarizeMarketing(activePlan, conversions, spend)).toMatchObject({
      totalSpend: money(20_000, 'USD'), attributedValue: money(50_000, 'USD'), leads: 1,
      qualifiedLeads: 1, purchases: 2, conversionCount: 4, cac: money(10_000, 'USD'), roas: 2.5,
      channelBreakdown: { email: { totalSpend: money(12_000, 'USD'), attributedValue: money(30_000, 'USD'), conversionCount: 2 } }
    });
  });

  it('returns null ROAS at zero spend and rejects mixed currencies', () => {
    const activePlan = createMarketingPlan(plan());
    const conversion: ConversionEvent = { id: 'conversion_1' as ConversionEventId, tenantId: tenantA, marketingPlanId: planId, eventType: 'purchase', channel: 'web', source: 'fictional-site', value: money(5_000, 'USD'), occurredAt: at, metadata: {} };
    expect(summarizeMarketing(activePlan, [conversion], [])).toMatchObject({ totalSpend: money(0, 'USD'), attributedValue: money(5_000, 'USD'), cac: money(0, 'USD'), roas: null });
    const mismatched: MarketingSpend = { id: 'spend_1' as MarketingSpendId, tenantId: tenantA, marketingPlanId: planId, channel: 'web', amount: money(1_000, 'CAD'), occurredAt: at };
    expect(() => summarizeMarketing(activePlan, [conversion], [mismatched])).toThrow('Currencies must match');
  });
});
