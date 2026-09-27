import type { EventBus, Repository, TenantEntity } from '../ports/index.js';
import type { DomainEvent, TenantId } from '../domain/shared.js';
import type { BrandRepository, Brand } from '../domain/clients.js';
import type { StrategyRepository, Strategy } from '../domain/strategy.js';
import type { CampaignRepository, Campaign } from '../domain/campaigns.js';
import type { ContentRepository, ContentItem } from '../domain/content.js';
import type { ApprovalRepository, ApprovalRequest } from '../domain/approvals.js';
import type { AssetRepository, MediaAsset } from '../domain/assets.js';
import type { PublicationRepository, PublicationIntent } from '../domain/distribution.js';
import type { ObservationRepository, PerformanceObservation } from '../domain/analytics.js';
import type { InsightRepository, Insight } from '../domain/learning.js';
import type { CreatorRepository, Creator } from '../domain/creators.js';
import type { EngagementRepository, Engagement, Invoice, InvoiceRepository } from '../domain/commerce.js';

export class InMemoryRepository<T extends TenantEntity> implements Repository<T> {
  readonly #items = new Map<string, T>();
  get(tenantId: TenantId, id: T['id']): Promise<T | undefined> {
    const item = this.#items.get(this.key(tenantId, id));
    return Promise.resolve(item === undefined ? undefined : structuredClone(item));
  }
  save(entity: T): Promise<void> { this.#items.set(this.key(entity.tenantId, entity.id), structuredClone(entity)); return Promise.resolve(); }
  list(tenantId: TenantId): Promise<readonly T[]> {
    return Promise.resolve([...this.#items.values()].filter((item) => item.tenantId === tenantId).map((item) => structuredClone(item)));
  }
  private key(tenantId: TenantId, id: string): string { return `${tenantId}:${id}`; }
}

export interface Repositories {
  readonly brands: BrandRepository; readonly strategies: StrategyRepository; readonly campaigns: CampaignRepository;
  readonly content: ContentRepository; readonly approvals: ApprovalRepository; readonly assets: AssetRepository;
  readonly publications: PublicationRepository; readonly observations: ObservationRepository; readonly insights: InsightRepository;
  readonly creators: CreatorRepository; readonly engagements: EngagementRepository; readonly invoices: InvoiceRepository;
}

export function createInMemoryRepositories(): Repositories {
  return {
    brands: new InMemoryRepository<Brand>(), strategies: new InMemoryRepository<Strategy>(), campaigns: new InMemoryRepository<Campaign>(),
    content: new InMemoryRepository<ContentItem>(), approvals: new InMemoryRepository<ApprovalRequest>(), assets: new InMemoryRepository<MediaAsset>(),
    publications: new InMemoryRepository<PublicationIntent>(), observations: new InMemoryRepository<PerformanceObservation>(), insights: new InMemoryRepository<Insight>(),
    creators: new InMemoryRepository<Creator>(), engagements: new InMemoryRepository<Engagement>(), invoices: new InMemoryRepository<Invoice>()
  };
}

export class InMemoryEventBus implements EventBus {
  readonly events: DomainEvent[] = [];
  publish(events: readonly DomainEvent[]): Promise<void> { this.events.push(...structuredClone(events)); return Promise.resolve(); }
}

export class FixedClock {
  constructor(private current: Date) {}
  now(): Date { return new Date(this.current); }
  set(value: Date): void { this.current = new Date(value); }
}

export class SequenceIdGenerator {
  #next = 1;
  next(prefix: string): string { return `${prefix}_${String(this.#next++).padStart(4, '0')}`; }
}
