import { invariant, nonEmpty, type BrandId, type TenantId } from './shared.js';
import type { Repository } from '../ports/index.js';

export interface BrandProfile {
  readonly purpose: string;
  readonly audiences: readonly string[];
  readonly voice: readonly string[];
  readonly objectives: readonly string[];
  readonly constraints: readonly string[];
  readonly platforms: readonly string[];
}

export interface Brand {
  readonly id: BrandId;
  readonly tenantId: TenantId;
  readonly organizationName: string;
  readonly name: string;
  readonly profile: BrandProfile;
  readonly createdAt: string;
}

export function createBrand(input: Brand): Brand {
  nonEmpty(input.organizationName, 'Organization name');
  nonEmpty(input.name, 'Brand name');
  nonEmpty(input.profile.purpose, 'Brand purpose');
  invariant(input.profile.audiences.length > 0, 'Brand needs at least one audience');
  return structuredClone(input);
}

export type BrandRepository = Repository<Brand>;
