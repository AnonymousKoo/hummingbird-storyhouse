import { describe, expect, it } from 'vitest';
import { money } from '../src/index.js';
import { campaignFixture, commandId, tenantA } from './helpers.js';

describe('golden path', () => {
  it('runs onboarding through publication, analytics, learning, and economics', async () => {
    const { service, repositories, events, campaign } = await campaignFixture();
    let content = await service.createContentBrief(commandId(), { tenantId: tenantA, campaignId: campaign.id, title: 'Workbench basics', idea: 'Teach a setup', hooks: ['Start with one surface'], brief: 'A 30-second tutorial', cta: 'Save this', metadata: { format: 'vertical' } });
    for (const state of ['script', 'production', 'edit', 'qa', 'review'] as const) content = await service.advanceContent(commandId(), tenantA, content.id, state);
    const request = await service.requestApproval(commandId(), { tenantId: tenantA, contentId: content.id, requestedBy: 'producer', reviewer: 'client' });
    await service.decideApproval(commandId(), { tenantId: tenantA, approvalId: request.id, decision: 'approved', actor: 'client' });
    const publication = await service.schedulePublication(commandId(), { tenantId: tenantA, contentId: content.id, channel: 'video', scheduledAt: '2026-02-10T12:00:00.000Z', variant: { caption: 'Build with us' } });
    await service.recordPublicationReceipt(commandId(), tenantA, publication.id, { externalId: 'post_123', url: 'https://example.invalid/post/123', publishedAt: '2026-02-10T12:00:00.000Z' });
    const observation = await service.ingestMetrics(commandId(), { tenantId: tenantA, publicationId: publication.id, windowStart: '2026-02-10T12:00:00.000Z', windowEnd: '2026-02-17T12:00:00.000Z', metrics: [{ name: 'views', value: 1200, unit: 'count' }] });
    const insight = await service.generateInsight(commandId(), tenantA, [observation.id]);
    const result = await service.createEngagement(commandId(), { tenantId: tenantA, campaignIds: [campaign.id], kind: 'project', package: { code: 'launch', name: 'Launch Story', price: money(200_000, 'USD'), deliverables: ['short'] }, contractedRevenue: money(200_000, 'USD'), costs: [{ category: 'production', description: 'Shoot', amount: money(50_000, 'USD') }], creatorPayouts: [{ creatorId: 'creator_1', amount: money(25_000, 'USD'), status: 'planned' }], startsAt: campaign.startAt });
    expect(insight.observationIds).toEqual([observation.id]); expect(result.economics.contributionMargin.amount).toBe(125_000);
    expect((await repositories.content.get(tenantA, content.id))?.state).toBe('published');
    expect(events.events.map((event) => event.type)).toContain('learning.insight_generated');
  });
});
