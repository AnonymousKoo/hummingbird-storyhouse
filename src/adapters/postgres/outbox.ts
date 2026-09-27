import type { QueryResultRow } from 'pg';
import { NotFoundError, type DomainEvent, type TenantId } from '../../domain/shared.js';
import type { EventBus, OutboxRecord, OutboxRepository } from '../../ports/index.js';
import type { PostgresQueryable } from './repositories.js';

interface OutboxRow extends QueryResultRow {
  readonly id: string;
  readonly tenant_id: TenantId;
  readonly aggregate_id: string;
  readonly event_type: string;
  readonly payload: unknown;
  readonly occurred_at: Date | string;
  readonly attempts: number;
  readonly dispatched_at: Date | string | null;
  readonly last_error: string | null;
}

function iso(value: Date | string): string { return value instanceof Date ? value.toISOString() : value; }

function toRecord(row: OutboxRow): OutboxRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    aggregateId: row.aggregate_id,
    type: row.event_type,
    payload: structuredClone(row.payload),
    occurredAt: iso(row.occurred_at),
    attempts: row.attempts,
    ...(row.dispatched_at === null ? {} : { dispatchedAt: iso(row.dispatched_at) }),
    ...(row.last_error === null ? {} : { lastError: row.last_error })
  };
}

export class PostgresOutboxEventBus implements EventBus {
  constructor(private readonly database: PostgresQueryable) {}

  async publish(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.database.query(
        `INSERT INTO storyhouse.outbox_events
          (id, tenant_id, aggregate_id, event_type, payload, occurred_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [event.id, event.tenantId, event.aggregateId, event.type, JSON.stringify(event.payload), event.occurredAt]
      );
    }
  }
}

export class PostgresOutboxRepository implements OutboxRepository {
  constructor(private readonly database: PostgresQueryable) {}

  async listPending(tenantId: TenantId, limit = 100): Promise<readonly OutboxRecord[]> {
    if (!Number.isSafeInteger(limit) || limit < 1) throw new RangeError('Outbox limit must be a positive integer');
    const result = await this.database.query<OutboxRow>(
      `SELECT id, tenant_id, aggregate_id, event_type, payload, occurred_at, attempts, dispatched_at, last_error
       FROM storyhouse.outbox_events
       WHERE tenant_id = $1 AND dispatched_at IS NULL
       ORDER BY occurred_at, id
       LIMIT $2`,
      [tenantId, limit]
    );
    return result.rows.map(toRecord);
  }

  async markDispatched(tenantId: TenantId, eventId: string, dispatchedAt: string): Promise<void> {
    const result = await this.database.query(
      `UPDATE storyhouse.outbox_events
       SET dispatched_at = $3, last_error = NULL
       WHERE tenant_id = $1 AND id = $2
       RETURNING id`,
      [tenantId, eventId, dispatchedAt]
    );
    if (result.rowCount !== 1) throw new NotFoundError('Outbox event');
  }

  async markFailed(tenantId: TenantId, eventId: string, error: string): Promise<void> {
    const result = await this.database.query(
      `UPDATE storyhouse.outbox_events
       SET attempts = attempts + 1, last_error = $3
       WHERE tenant_id = $1 AND id = $2
       RETURNING id`,
      [tenantId, eventId, error]
    );
    if (result.rowCount !== 1) throw new NotFoundError('Outbox event');
  }
}
