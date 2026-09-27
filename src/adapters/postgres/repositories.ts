import type { QueryResult, QueryResultRow } from 'pg';
import type { PerformanceObservation } from '../../domain/analytics.js';
import type { ApprovalRequest } from '../../domain/approvals.js';
import type { MediaAsset } from '../../domain/assets.js';
import type { Campaign } from '../../domain/campaigns.js';
import type { Brand } from '../../domain/clients.js';
import type { Engagement, Invoice } from '../../domain/commerce.js';
import type { ContentItem } from '../../domain/content.js';
import type { Creator } from '../../domain/creators.js';
import type { PublicationIntent } from '../../domain/distribution.js';
import type { Insight } from '../../domain/learning.js';
import { ConflictError, type TenantId } from '../../domain/shared.js';
import type { Strategy } from '../../domain/strategy.js';
import type { Repository, StoryhouseRepositories, TenantEntity } from '../../ports/index.js';

export interface PostgresQueryable {
  query<TRow extends QueryResultRow = QueryResultRow>(text: string, values?: readonly unknown[]): Promise<QueryResult<TRow>>;
}

interface RepositoryConfig<T extends TenantEntity> {
  readonly table: string;
  readonly columns: (entity: T) => Readonly<Record<string, string | readonly string[] | null>>;
}

interface PayloadRow<T> extends QueryResultRow { readonly payload: T }

export interface PostgresRepositoryOptions { readonly lockReads?: boolean }

export class PostgresRepository<T extends TenantEntity> implements Repository<T> {
  constructor(
    private readonly database: PostgresQueryable,
    private readonly config: RepositoryConfig<T>,
    private readonly options: PostgresRepositoryOptions = {}
  ) {}

  async get(tenantId: TenantId, id: T['id']): Promise<T | undefined> {
    const result = await this.database.query<PayloadRow<T>>(
      `SELECT payload FROM storyhouse.${this.config.table} WHERE tenant_id = $1 AND id = $2${this.options.lockReads === true ? ' FOR UPDATE' : ''}`,
      [tenantId, id]
    );
    const row = result.rows[0];
    return row === undefined ? undefined : structuredClone(row.payload);
  }

  async save(entity: T): Promise<void> {
    const relational = this.config.columns(entity);
    const columns = ['id', 'tenant_id', 'payload', ...Object.keys(relational)];
    const values: readonly unknown[] = [entity.id, entity.tenantId, JSON.stringify(entity), ...Object.values(relational)];
    const assignments = columns.slice(2).map((column) => `${column} = EXCLUDED.${column}`).join(', ');
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const result = await this.database.query(
      `INSERT INTO storyhouse.${this.config.table} (${columns.join(', ')}) VALUES (${placeholders})
       ON CONFLICT (id) DO UPDATE SET ${assignments}
       WHERE storyhouse.${this.config.table}.tenant_id = EXCLUDED.tenant_id
       RETURNING id`,
      values
    );
    if (result.rowCount !== 1) throw new ConflictError(`Cannot save ${this.config.table} across a tenant boundary`);
  }

  async list(tenantId: TenantId): Promise<readonly T[]> {
    const result = await this.database.query<PayloadRow<T>>(
      `SELECT payload FROM storyhouse.${this.config.table} WHERE tenant_id = $1 ORDER BY id`,
      [tenantId]
    );
    return result.rows.map((row) => structuredClone(row.payload));
  }
}

export function createPostgresRepositories(database: PostgresQueryable, options: PostgresRepositoryOptions = {}): StoryhouseRepositories {
  return {
    brands: new PostgresRepository<Brand>(database, { table: 'brands', columns: (entity) => ({ created_at: entity.createdAt }) }, options),
    strategies: new PostgresRepository<Strategy>(database, { table: 'strategies', columns: (entity) => ({ brand_id: entity.brandId, created_at: entity.createdAt }) }, options),
    campaigns: new PostgresRepository<Campaign>(database, { table: 'campaigns', columns: (entity) => ({ brand_id: entity.brandId, strategy_id: entity.strategyId, created_at: entity.createdAt }) }, options),
    content: new PostgresRepository<ContentItem>(database, { table: 'content_items', columns: (entity) => ({ campaign_id: entity.campaignId, parent_id: entity.parentId ?? null, created_at: entity.createdAt, updated_at: entity.updatedAt }) }, options),
    approvals: new PostgresRepository<ApprovalRequest>(database, { table: 'approval_requests', columns: (entity) => ({ content_id: entity.contentId, created_at: entity.createdAt }) }, options),
    assets: new PostgresRepository<MediaAsset>(database, { table: 'media_assets', columns: (entity) => ({ content_ids: entity.contentIds, campaign_ids: entity.campaignIds }) }, options),
    publications: new PostgresRepository<PublicationIntent>(database, { table: 'publication_intents', columns: (entity) => ({ content_id: entity.contentId, created_at: entity.createdAt }) }, options),
    observations: new PostgresRepository<PerformanceObservation>(database, { table: 'performance_observations', columns: (entity) => ({ publication_id: entity.publicationId, content_id: entity.contentId, campaign_id: entity.campaignId, strategy_id: entity.strategyId, observed_at: entity.observedAt }) }, options),
    insights: new PostgresRepository<Insight>(database, { table: 'insights', columns: (entity) => ({ strategy_id: entity.strategyId, campaign_id: entity.campaignId, observation_ids: entity.observationIds, created_at: entity.createdAt }) }, options),
    creators: new PostgresRepository<Creator>(database, { table: 'creators', columns: (entity) => ({ campaign_ids: entity.assignments.map((assignment) => assignment.campaignId) }) }, options),
    engagements: new PostgresRepository<Engagement>(database, { table: 'engagements', columns: (entity) => ({ campaign_ids: entity.campaignIds, starts_at: entity.startsAt }) }, options),
    invoices: new PostgresRepository<Invoice>(database, { table: 'invoices', columns: (entity) => ({ engagement_id: entity.engagementId }) }, options)
  };
}
