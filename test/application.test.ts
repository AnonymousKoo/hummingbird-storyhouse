import { describe, expect, it } from 'vitest';
import { NotFoundError, type ContentId } from '../src/index.js';
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
});
