import { describe, expect, it } from 'vitest';
import { OperatorQueryService, NotFoundError, money, type ActivityRepository, type OutboxRecord } from '../src/index.js';
import { campaignFixture, commandId, tenantA, tenantB } from './helpers.js';

describe('operator read models', () => {
  it('assembles dashboard and content detail without leaking joins to consumers', async () => {
    const setup = await campaignFixture();
    const content = await setup.service.createContentBrief(commandId(), {
      tenantId: tenantA, campaignId: setup.campaign.id, title: 'A fictional maker note', idea: 'Show one clear technique.',
      hooks: ['Begin with the detail.'], brief: 'A concise editorial brief.', cta: 'Save the note.'
    });
    await setup.service.advanceContent(commandId(), tenantA, content.id, 'script');
    const activity: ActivityRepository = {
      listRecent(tenantId, limit = 20): Promise<readonly OutboxRecord[]> {
        return Promise.resolve(setup.events.events.filter((event) => event.tenantId === tenantId).slice(-limit).reverse().map((event) => ({ ...event, attempts: 0 })));
      }
    };
    const queries = new OperatorQueryService(setup.repositories, activity, { now: () => new Date('2026-02-01T00:00:00.000Z') });

    const dashboard = await queries.dashboard(tenantA);
    expect(dashboard.counts).toMatchObject({ brands: 1, activeCampaigns: 1, contentInProduction: 1 });
    expect(dashboard.pipeline.script).toBe(1);
    expect(dashboard.recentActivity[0]?.type).toBe('content.advanced');

    const detail = await queries.contentDetail(tenantA, content.id);
    expect(detail).toMatchObject({ campaignName: 'Maker Month', brandName: 'Cedar & Finch', nextState: 'production' });
  });

  it('keeps every operator query inside its explicit tenant boundary', async () => {
    const setup = await campaignFixture();
    const activity: ActivityRepository = { listRecent: () => Promise.resolve([]) };
    const queries = new OperatorQueryService(setup.repositories, activity, { now: () => new Date() });

    expect(await queries.brands(tenantB)).toEqual([]);
    expect(await queries.campaigns(tenantB)).toEqual([]);
    expect(await queries.content(tenantB)).toEqual([]);
    expect((await queries.dashboard(tenantB)).counts.brands).toBe(0);
    await expect(queries.brand(tenantB, setup.brand.id)).rejects.toBeInstanceOf(NotFoundError);
    await expect(queries.campaign(tenantB, setup.campaign.id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('provides plan-scoped marketing detail, activity, and performance reads', async () => {
    const setup = await campaignFixture();
    const plan = await setup.service.createMarketingPlan(commandId(), {
      tenantId: tenantA, brandId: setup.brand.id, strategyId: setup.strategy.id, name: 'Field workshop growth',
      businessOutcome: 'Earn qualified workshop demand', positioning: 'Useful projects taught with care',
      offer: { name: 'Field workshop', promise: 'Complete one practical build', cta: 'Reserve a place' },
      audienceSegments: [{ id: 'makers', name: 'Makers', description: 'Curious local builders', need: 'Guided practice' }],
      funnelStages: [{ stage: 'conversion', objective: 'Earn reservations', cta: 'Reserve', channels: ['web'] }],
      conversionGoals: [{ name: 'Reservations', eventType: 'booking', target: 10 }]
    });
    await setup.service.linkMarketingCampaign(commandId(), tenantA, plan.id, setup.campaign.id);
    await setup.service.activateMarketingPlan(commandId(), tenantA, plan.id);
    await setup.service.recordMarketingSpend(commandId(), { tenantId: tenantA, marketingPlanId: plan.id, campaignId: setup.campaign.id, channel: 'paid_social', amount: money(10_000, 'USD'), occurredAt: '2026-01-05T00:00:00.000Z' });
    await setup.service.recordConversion(commandId(), { tenantId: tenantA, marketingPlanId: plan.id, campaignId: setup.campaign.id, eventType: 'purchase', channel: 'paid_social', source: 'fictional-maker-release', value: money(25_000, 'USD'), occurredAt: '2026-01-06T00:00:00.000Z', metadata: { placement: 'field-note' } });
    await setup.service.createMarketingExperiment(commandId(), { tenantId: tenantA, marketingPlanId: plan.id, campaignId: setup.campaign.id, name: 'Reservation CTA', hypothesis: 'Specific utility improves action', variants: [{ id: 'utility', label: 'Utility', description: 'Name the build' }, { id: 'community', label: 'Community', description: 'Name the group' }], primaryMetric: 'booking_rate' });
    const queries = new OperatorQueryService(setup.repositories, { listRecent: () => Promise.resolve([]) }, { now: () => new Date() });

    expect(await queries.marketingPlans(tenantA)).toMatchObject([{ brandName: 'Cedar & Finch', campaignCount: 1 }]);
    expect((await queries.marketingPlan(tenantA, plan.id)).campaigns).toHaveLength(1);
    expect(await queries.marketingExperiments(tenantA, plan.id)).toHaveLength(1);
    expect(await queries.marketingConversions(tenantA, plan.id)).toHaveLength(1);
    expect(await queries.marketingSpend(tenantA, plan.id)).toHaveLength(1);
    expect(await queries.marketingPerformance(tenantA, plan.id)).toMatchObject({ totalSpend: money(10_000, 'USD'), attributedValue: money(25_000, 'USD'), roas: 2.5 });
    expect(await queries.marketingPlans(tenantB)).toEqual([]);
    await expect(queries.marketingPlan(tenantB, plan.id)).rejects.toBeInstanceOf(NotFoundError);
  });
});
