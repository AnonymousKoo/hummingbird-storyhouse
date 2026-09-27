import type { PerformanceObservation } from '../domain/analytics.js';
import type { ApprovalRequest } from '../domain/approvals.js';
import type { MediaAsset } from '../domain/assets.js';
import type { Campaign } from '../domain/campaigns.js';
import type { Brand } from '../domain/clients.js';
import type { Engagement, Invoice } from '../domain/commerce.js';
import type { ContentItem } from '../domain/content.js';
import type { Creator } from '../domain/creators.js';
import type { PublicationIntent } from '../domain/distribution.js';
import type { Insight } from '../domain/learning.js';
import type { ConversionEvent, MarketingExperiment, MarketingPlan, MarketingSpend } from '../domain/marketing.js';
import type { CommandId, DomainEvent, TenantId } from '../domain/shared.js';
import type { Strategy } from '../domain/strategy.js';

export interface Clock { now(): Date }
export interface IdGenerator { next(prefix: string): string }
export interface EventBus { publish(events: readonly DomainEvent[]): Promise<void> }

export interface TenantEntity { readonly id: string; readonly tenantId: TenantId }
export interface Repository<T extends TenantEntity> {
  get(tenantId: TenantId, id: T['id']): Promise<T | undefined>;
  save(entity: T): Promise<void>;
  list(tenantId: TenantId): Promise<readonly T[]>;
}

export interface StoryhouseRepositories {
  readonly brands: Repository<Brand>;
  readonly strategies: Repository<Strategy>;
  readonly campaigns: Repository<Campaign>;
  readonly content: Repository<ContentItem>;
  readonly approvals: Repository<ApprovalRequest>;
  readonly assets: Repository<MediaAsset>;
  readonly publications: Repository<PublicationIntent>;
  readonly observations: Repository<PerformanceObservation>;
  readonly insights: Repository<Insight>;
  readonly creators: Repository<Creator>;
  readonly engagements: Repository<Engagement>;
  readonly invoices: Repository<Invoice>;
  readonly marketingPlans: Repository<MarketingPlan>;
  readonly marketingExperiments: Repository<MarketingExperiment>;
  readonly conversionEvents: Repository<ConversionEvent>;
  readonly marketingSpend: Repository<MarketingSpend>;
}

export interface CommandReceipt<TResult = unknown> {
  readonly commandId: CommandId;
  readonly tenantId: TenantId;
  readonly commandType: string;
  readonly commandPayload: unknown;
  readonly result: TResult;
  readonly completedAt: string;
}

export interface CommandReceiptRepository {
  get(tenantId: TenantId, commandId: CommandId): Promise<CommandReceipt | undefined>;
  save(receipt: CommandReceipt): Promise<void>;
}

export interface OutboxRecord extends DomainEvent {
  readonly attempts: number;
  readonly dispatchedAt?: string;
  readonly lastError?: string;
}

export interface OutboxRepository {
  listPending(tenantId: TenantId, limit?: number): Promise<readonly OutboxRecord[]>;
  markDispatched(tenantId: TenantId, eventId: string, dispatchedAt: string): Promise<void>;
  markFailed(tenantId: TenantId, eventId: string, error: string): Promise<void>;
}

/** Read-only access to committed domain activity for operator-facing read models. */
export interface ActivityRepository {
  listRecent(tenantId: TenantId, limit?: number): Promise<readonly OutboxRecord[]>;
}

export interface UnitOfWork<TContext> {
  transaction<TResult>(operation: (context: TContext) => Promise<TResult>): Promise<TResult>;
}

export interface AssetStorage {
  put(key: string, bytes: Uint8Array, mediaType: string): Promise<string>;
  get(locator: string): Promise<Uint8Array>;
}
