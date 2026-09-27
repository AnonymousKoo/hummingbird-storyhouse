import { invariant, nonEmpty, type CampaignId, type CreatorId, type Money, type TenantId } from './shared.js';
import type { Repository } from '../ports/index.js';

export interface CreatorRate { readonly service: string; readonly rate: Money }
export interface CreatorAssignment { readonly campaignId: CampaignId; readonly deliverables: readonly string[]; readonly agreedFee: Money }
export interface Creator {
  readonly id: CreatorId; readonly tenantId: TenantId; readonly displayName: string;
  readonly specialties: readonly string[]; readonly rates: readonly CreatorRate[];
  readonly availabilityReference?: string; readonly assignments: readonly CreatorAssignment[];
}
export function createCreator(input: Creator): Creator {
  nonEmpty(input.displayName, 'Creator name'); invariant(input.specialties.length > 0, 'Creator needs a specialty');
  return structuredClone(input);
}
export type CreatorRepository = Repository<Creator>;
