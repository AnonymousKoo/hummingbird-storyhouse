import { InvalidTransitionError, invariant, nonEmpty, type ContentId, type PublicationId, type TenantId } from './shared.js';
import type { Repository } from '../ports/index.js';

export type PublicationStatus = 'scheduled' | 'published' | 'failed';
export interface PublicationReceipt { readonly externalId: string; readonly url?: string; readonly publishedAt: string }
export interface PublicationIntent {
  readonly id: PublicationId; readonly tenantId: TenantId; readonly contentId: ContentId;
  readonly channel: string; readonly variant: Readonly<Record<string, string>>; readonly scheduledAt: string;
  readonly status: PublicationStatus; readonly receipt?: PublicationReceipt; readonly createdAt: string;
}
export function createPublication(input: PublicationIntent): PublicationIntent {
  nonEmpty(input.channel, 'Publication channel');
  invariant(input.status === 'scheduled', 'Publication intent starts scheduled');
  return structuredClone(input);
}
export function recordReceipt(intent: PublicationIntent, receipt: PublicationReceipt): PublicationIntent {
  if (intent.status !== 'scheduled') throw new InvalidTransitionError(intent.status, 'published');
  nonEmpty(receipt.externalId, 'External publication ID');
  return { ...intent, status: 'published', receipt: structuredClone(receipt) };
}
export type PublicationRepository = Repository<PublicationIntent>;
