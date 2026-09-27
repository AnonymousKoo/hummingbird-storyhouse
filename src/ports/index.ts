import type { DomainEvent, TenantId } from '../domain/shared.js';

export interface Clock { now(): Date }
export interface IdGenerator { next(prefix: string): string }
export interface EventBus { publish(events: readonly DomainEvent[]): Promise<void> }

export interface TenantEntity { readonly id: string; readonly tenantId: TenantId }
export interface Repository<T extends TenantEntity> {
  get(tenantId: TenantId, id: T['id']): Promise<T | undefined>;
  save(entity: T): Promise<void>;
  list(tenantId: TenantId): Promise<readonly T[]>;
}

export interface AssetStorage {
  put(key: string, bytes: Uint8Array, mediaType: string): Promise<string>;
  get(locator: string): Promise<Uint8Array>;
}
