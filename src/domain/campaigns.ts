import { InvalidTransitionError, invariant, nonEmpty, type BrandId, type CampaignId, type Money, type StrategyId, type TenantId } from './shared.js';
import type { Repository } from '../ports/index.js';

export type CampaignStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export interface Campaign {
  readonly id: CampaignId; readonly tenantId: TenantId; readonly brandId: BrandId; readonly strategyId: StrategyId;
  readonly name: string; readonly goals: readonly string[]; readonly startAt: string; readonly endAt: string;
  readonly budget: Money; readonly channels: readonly string[]; readonly deliverables: readonly string[];
  readonly assigneeIds: readonly string[]; readonly status: CampaignStatus; readonly createdAt: string;
}
export function createCampaign(input: Campaign): Campaign {
  nonEmpty(input.name, 'Campaign name');
  invariant(input.goals.length > 0, 'Campaign needs a goal');
  invariant(new Date(input.startAt) <= new Date(input.endAt), 'Campaign dates are out of order');
  invariant(input.budget.amount >= 0, 'Campaign budget cannot be negative');
  return structuredClone(input);
}
export function activateCampaign(campaign: Campaign): Campaign {
  if (campaign.status !== 'draft') throw new InvalidTransitionError(campaign.status, 'active');
  return { ...campaign, status: 'active' };
}
export type CampaignRepository = Repository<Campaign>;
