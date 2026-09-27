import { describe, expect, it } from 'vitest';
import { advanceContent, calculateCampaignEconomics, calculateEconomics, createContent, invoiceTotal, money, type CampaignId, type ContentId, type Engagement, type EngagementId, type Invoice, type InvoiceId } from '../src/index.js';
import { tenantA } from './helpers.js';

describe('domain invariants', () => {
  it('requires integer minor units', () => { expect(() => money(10.5, 'USD')).toThrow('integer'); });
  it('only permits the next production state', () => {
    const content = createContent({ id: 'content_1' as ContentId, tenantId: tenantA, campaignId: 'campaign_1' as CampaignId, title: 'Title', idea: 'Idea', hooks: ['Hook'], brief: 'Brief', cta: 'Act', metadata: {}, state: 'brief', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' });
    expect(() => advanceContent(content, 'edit', '2026-01-02T00:00:00.000Z')).toThrow('Cannot transition');
    expect(advanceContent(content, 'script', '2026-01-02T00:00:00.000Z').state).toBe('script');
  });
  it('calculates invoice totals and contribution margin in minor units', () => {
    const engagement: Engagement = { id: 'eng_1' as EngagementId, tenantId: tenantA, campaignIds: ['camp_1' as CampaignId], kind: 'project', package: { code: 'p', name: 'Package', price: money(100_000, 'USD'), deliverables: [] }, contractedRevenue: money(100_000, 'USD'), costs: [{ category: 'production', description: 'Edit', amount: money(25_000, 'USD') }], creatorPayouts: [{ creatorId: 'creator_1', amount: money(15_000, 'USD'), status: 'paid' }], startsAt: '2026-01-01T00:00:00.000Z' };
    expect(calculateEconomics(engagement)).toEqual({ revenue: money(100_000, 'USD'), costs: money(40_000, 'USD'), contributionMargin: money(60_000, 'USD'), marginRatio: 0.6 });
    expect(calculateCampaignEconomics('camp_1' as CampaignId, money(80_000, 'USD'), [money(20_000, 'USD')], [money(10_000, 'USD')]).contributionMargin.amount).toBe(50_000);
    const invoice: Invoice = { id: 'invoice_1' as InvoiceId, tenantId: tenantA, engagementId: engagement.id, status: 'draft', lines: [{ description: 'Episodes', quantity: 3, unitPrice: money(25_000, 'USD') }] };
    expect(invoiceTotal(invoice)).toEqual(money(75_000, 'USD'));
  });
});
