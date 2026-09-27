import { InvalidTransitionError, invariant, nonEmpty, type CampaignId, type ContentId, type TenantId } from './shared.js';
import type { Repository } from '../ports/index.js';

export type ProductionState = 'idea' | 'brief' | 'script' | 'production' | 'edit' | 'qa' | 'review' | 'approved' | 'scheduled' | 'published';
export const productionPath: readonly ProductionState[] = ['idea', 'brief', 'script', 'production', 'edit', 'qa', 'review', 'approved', 'scheduled', 'published'];
export interface ContentItem {
  readonly id: ContentId; readonly tenantId: TenantId; readonly campaignId: CampaignId;
  readonly title: string; readonly idea: string; readonly hooks: readonly string[]; readonly brief: string;
  readonly copy?: string; readonly parentId?: ContentId; readonly variantLabel?: string;
  readonly cta: string; readonly metadata: Readonly<Record<string, string>>;
  readonly state: ProductionState; readonly createdAt: string; readonly updatedAt: string;
}
export function createContent(input: ContentItem): ContentItem {
  nonEmpty(input.title, 'Content title'); nonEmpty(input.idea, 'Content idea'); nonEmpty(input.brief, 'Content brief');
  invariant(input.hooks.length > 0, 'Content needs at least one hook');
  invariant(input.state === 'brief', 'A completed content brief starts in brief state');
  return structuredClone(input);
}
export function advanceContent(content: ContentItem, to: ProductionState, at: string): ContentItem {
  const current = productionPath.indexOf(content.state);
  if (productionPath[current + 1] !== to) throw new InvalidTransitionError(content.state, to);
  return { ...content, state: to, updatedAt: at };
}

export function returnContentForRevision(content: ContentItem, at: string): ContentItem {
  if (content.state !== 'review') throw new InvalidTransitionError(content.state, 'edit');
  return { ...content, state: 'edit', updatedAt: at };
}
export type ContentRepository = Repository<ContentItem>;
