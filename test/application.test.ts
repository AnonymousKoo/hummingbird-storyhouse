import { describe, expect, it } from 'vitest';
import { money, NotFoundError, type ContentId } from '../src/index.js';
import { campaignFixture, commandId, tenantA, tenantB } from './helpers.js';

describe('application boundaries', () => {
  it('isolates repository records by tenant', async () => {
    const { repositories, brand } = await campaignFixture();
    expect(await repositories.brands.get(tenantA, brand.id)).toBeDefined();
    expect(await repositories.brands.get(tenantB, brand.id)).toBeUndefined();
  });
  it('prevents cross-tenant aggregate access', async () => {
    const { service, campaign } = await campaignFixture();
    await expect(service.createContentBrief(commandId(), { tenantId: tenantB, campaignId: campaign.id, title: 'X', idea: 'X', hooks: ['X'], brief: 'X', cta: 'X' })).rejects.toBeInstanceOf(NotFoundError);
  });
  it('gates scheduling on approval', async () => {
    const { service, campaign } = await campaignFixture();
    const content = await service.createContentBrief(commandId(), { tenantId: tenantA, campaignId: campaign.id, title: 'X', idea: 'X', hooks: ['X'], brief: 'X', cta: 'X' });
    await expect(service.schedulePublication(commandId(), { tenantId: tenantA, contentId: content.id, channel: 'video', scheduledAt: '2026-02-01T00:00:00.000Z' })).rejects.toThrow('approved');
  });
  it('returns reviewed content to edit when revision is requested', async () => {
    const { service, repositories, campaign } = await campaignFixture();
    let content = await service.createContentBrief(commandId(), { tenantId: tenantA, campaignId: campaign.id, title: 'Revise me', idea: 'An idea', hooks: ['A hook'], brief: 'A brief', cta: 'Act' });
    for (const state of ['script', 'production', 'edit', 'qa', 'review'] as const) content = await service.advanceContent(commandId(), tenantA, content.id, state);
    const approval = await service.requestApproval(commandId(), { tenantId: tenantA, contentId: content.id, requestedBy: 'producer', reviewer: 'client' });
    await service.decideApproval(commandId(), { tenantId: tenantA, approvalId: approval.id, decision: 'revision_requested', actor: 'client', note: 'Tighten the opening.' });
    expect((await repositories.content.get(tenantA, content.id))?.state).toBe('edit');
  });
  it('deduplicates an idempotent command', async () => {
    const { service, repositories } = await campaignFixture(); const id = commandId();
    const input = { tenantId: tenantA, organizationName: 'Repeat Co', name: 'Repeat', profile: { purpose: 'Test repeat delivery', audiences: ['testers'], voice: ['plain'], objectives: ['test'], constraints: [], platforms: [] } };
    const [first, second] = await Promise.all([service.onboardBrand(id, input), service.onboardBrand(id, input)]);
    expect(second.id).toBe(first.id); expect((await repositories.brands.list(tenantA)).filter((brand) => brand.name === 'Repeat')).toHaveLength(1);
  });
  it('rejects invalid dedicated state transitions', async () => {
    const { service } = await campaignFixture();
    await expect(service.advanceContent(commandId(), tenantA, 'missing' as ContentId, 'approved')).rejects.toThrow('dedicated workflows');
  });
  it('coordinates marketing plans above matching campaigns', async () => {
    const { service, repositories, brand, strategy, campaign } = await campaignFixture();
    const plan = await service.createMarketingPlan(commandId(), {
      tenantId: tenantA, brandId: brand.id, strategyId: strategy.id, name: 'Maker growth loop',
      businessOutcome: 'Increase qualified workshop bookings', positioning: 'Practical teaching for local makers',
      offer: { name: 'Maker session', promise: 'Leave with one finished project', cta: 'Book a session' },
      audienceSegments: [{ id: 'new_makers', name: 'New makers', description: 'Neighbors beginning a craft', need: 'A welcoming first project' }],
      funnelStages: [{ stage: 'conversion', objective: 'Earn bookings', cta: 'Book a session', channels: ['web'] }],
      conversionGoals: [{ name: 'Workshop bookings', eventType: 'booking', target: 12 }]
    });
    await expect(service.recordMarketingSpend(commandId(), {
      tenantId: tenantA, marketingPlanId: plan.id, channel: 'paid_social',
      amount: money(1_000, 'USD'), occurredAt: '2026-02-01T00:00:00.000Z'
    })).rejects.toThrow('active marketing plan');
    const draftExperiment = await service.createMarketingExperiment(commandId(), {
      tenantId: tenantA, marketingPlanId: plan.id, name: 'Draft plan experiment',
      hypothesis: 'A useful frame changes intent', primaryMetric: 'booking',
      variants: [{ id: 'a', label: 'A', description: 'A' }, { id: 'b', label: 'B', description: 'B' }]
    });
    await expect(service.startMarketingExperiment(commandId(), tenantA, draftExperiment.id)).rejects.toThrow('active marketing plan');
    const active = await service.activateMarketingPlan(commandId(), tenantA, plan.id);
    expect(active.status).toBe('active');
    const linked = await service.linkMarketingCampaign(commandId(), tenantA, plan.id, campaign.id);
    const repeated = await service.linkMarketingCampaign(commandId(), tenantA, plan.id, campaign.id);
    expect(repeated.campaignIds).toEqual([campaign.id]);
    expect((await repositories.marketingPlans.get(tenantA, plan.id))?.campaignIds).toEqual([campaign.id]);
    await expect(service.createMarketingExperiment(commandId(), {
      tenantId: tenantA, marketingPlanId: plan.id, campaignId: 'campaign_missing' as typeof campaign.id,
      name: 'Unlinked experiment', hypothesis: 'A missing campaign works', primaryMetric: 'booking',
      variants: [{ id: 'a', label: 'A', description: 'A' }, { id: 'b', label: 'B', description: 'B' }]
    })).rejects.toBeInstanceOf(NotFoundError);
    expect(linked.status).toBe('active');
  });

  it('rejects cross-tenant marketing access', async () => {
    const { service, brand, strategy } = await campaignFixture();
    const plan = await service.createMarketingPlan(commandId(), {
      tenantId: tenantA, brandId: brand.id, strategyId: strategy.id, name: 'Tenant-safe plan', businessOutcome: 'Protect tenant records', positioning: 'Safety first',
      offer: { name: 'Safe offer', promise: 'Scoped records', cta: 'Continue' }, audienceSegments: [{ id: 'operators', name: 'Operators', description: 'Workspace operators', need: 'Safe access' }],
      funnelStages: [{ stage: 'awareness', objective: 'Explain safety', cta: 'Learn', channels: ['web'] }], conversionGoals: [{ name: 'Safety reads', eventType: 'custom' }]
    });
    await expect(service.activateMarketingPlan(commandId(), tenantB, plan.id)).rejects.toBeInstanceOf(NotFoundError);
  });
});
