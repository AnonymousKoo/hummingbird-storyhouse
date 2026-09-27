import { addMoney, invariant, money, nonEmpty, type CampaignId, type EngagementId, type InvoiceId, type Money, type TenantId } from './shared.js';
import type { Repository } from '../ports/index.js';

export interface ServicePackage { readonly code: string; readonly name: string; readonly price: Money; readonly deliverables: readonly string[] }
export type EngagementKind = 'retainer' | 'project';
export interface Cost { readonly category: 'production' | 'creator' | 'platform' | 'other'; readonly description: string; readonly amount: Money }
export interface CreatorPayout { readonly creatorId: string; readonly amount: Money; readonly status: 'planned' | 'paid' }
export interface Engagement {
  readonly id: EngagementId; readonly tenantId: TenantId; readonly campaignIds: readonly CampaignId[];
  readonly kind: EngagementKind; readonly package: ServicePackage; readonly contractedRevenue: Money;
  readonly costs: readonly Cost[]; readonly creatorPayouts: readonly CreatorPayout[]; readonly startsAt: string; readonly endsAt?: string;
}
export interface InvoiceLine { readonly description: string; readonly quantity: number; readonly unitPrice: Money }
export interface Invoice { readonly id: InvoiceId; readonly tenantId: TenantId; readonly engagementId: EngagementId; readonly lines: readonly InvoiceLine[]; readonly status: 'draft' | 'issued' | 'paid' }
export interface Economics { readonly revenue: Money; readonly costs: Money; readonly contributionMargin: Money; readonly marginRatio: number }
export interface CampaignEconomics extends Economics { readonly campaignId: CampaignId }

export function createEngagement(input: Engagement): Engagement {
  nonEmpty(input.package.name, 'Package name'); invariant(input.campaignIds.length > 0, 'Engagement needs a campaign');
  invariant(input.contractedRevenue.amount >= 0, 'Revenue cannot be negative');
  for (const cost of input.costs) invariant(cost.amount.currency === input.contractedRevenue.currency, 'Cost currency must match revenue');
  for (const payout of input.creatorPayouts) invariant(payout.amount.currency === input.contractedRevenue.currency, 'Payout currency must match revenue');
  return structuredClone(input);
}
export function calculateEconomics(engagement: Engagement, campaignId?: CampaignId): Economics {
  if (campaignId !== undefined) invariant(engagement.campaignIds.includes(campaignId), 'Campaign is not part of engagement');
  return contributionMargin(engagement.contractedRevenue, engagement.costs.map((cost) => cost.amount), engagement.creatorPayouts.map((payout) => payout.amount));
}
export function calculateCampaignEconomics(campaignId: CampaignId, revenue: Money, costs: readonly Money[], payouts: readonly Money[]): CampaignEconomics {
  return { campaignId, ...contributionMargin(revenue, costs, payouts) };
}
export function invoiceTotal(invoice: Invoice): Money {
  invariant(invoice.lines.length > 0, 'Invoice needs a line');
  const currency = invoice.lines[0]?.unitPrice.currency ?? 'USD';
  return invoice.lines.reduce((total, line) => {
    invariant(Number.isInteger(line.quantity) && line.quantity > 0, 'Invoice quantity must be a positive integer');
    return addMoney(total, money(line.unitPrice.amount * line.quantity, line.unitPrice.currency));
  }, money(0, currency));
}
function contributionMargin(revenue: Money, costs: readonly Money[], payouts: readonly Money[]): Economics {
  invariant(revenue.amount >= 0, 'Revenue cannot be negative');
  const allCosts = [...costs, ...payouts];
  const totalCosts = allCosts.reduce((total, value) => addMoney(total, value), money(0, revenue.currency));
  const margin = money(revenue.amount - totalCosts.amount, revenue.currency);
  return { revenue, costs: totalCosts, contributionMargin: margin, marginRatio: revenue.amount === 0 ? 0 : margin.amount / revenue.amount };
}
export type EngagementRepository = Repository<Engagement>;
export type InvoiceRepository = Repository<Invoice>;
