import { invariant, nonEmpty, type AssetId, type CampaignId, type ContentId, type TenantId } from './shared.js';
import type { Repository } from '../ports/index.js';

export interface AssetVersion { readonly version: number; readonly locator: string; readonly mediaType: string; readonly createdAt: string }
export interface UsageRights { readonly owner: string; readonly territories: readonly string[]; readonly startsAt: string; readonly endsAt?: string }
export interface MediaAsset {
  readonly id: AssetId; readonly tenantId: TenantId; readonly name: string; readonly kind: 'image' | 'video' | 'audio' | 'document';
  readonly versions: readonly AssetVersion[]; readonly rights: UsageRights; readonly contentIds: readonly ContentId[]; readonly campaignIds: readonly CampaignId[];
}
export function createAsset(input: MediaAsset): MediaAsset {
  nonEmpty(input.name, 'Asset name'); nonEmpty(input.rights.owner, 'Rights owner');
  invariant(input.versions.length > 0, 'Asset needs a version');
  return structuredClone(input);
}
export type AssetRepository = Repository<MediaAsset>;
