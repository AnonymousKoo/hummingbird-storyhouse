import type { QueryResultRow } from 'pg';
import type { CommandId, TenantId } from '../../domain/shared.js';
import type { CommandReceipt, CommandReceiptRepository } from '../../ports/index.js';
import type { PostgresQueryable } from './repositories.js';

interface ReceiptRow extends QueryResultRow {
  readonly command_id: CommandId;
  readonly tenant_id: TenantId;
  readonly command_type: string;
  readonly command_payload: unknown;
  readonly result: unknown;
  readonly completed_at: Date | string;
}

export class PostgresCommandReceiptRepository implements CommandReceiptRepository {
  constructor(private readonly database: PostgresQueryable) {}

  async get(tenantId: TenantId, commandId: CommandId): Promise<CommandReceipt | undefined> {
    const result = await this.database.query<ReceiptRow>(
      `SELECT command_id, tenant_id, command_type, command_payload, result, completed_at
       FROM storyhouse.command_receipts
       WHERE tenant_id = $1 AND command_id = $2`,
      [tenantId, commandId]
    );
    const row = result.rows[0];
    if (row === undefined) return undefined;
    return {
      commandId: row.command_id,
      tenantId: row.tenant_id,
      commandType: row.command_type,
      commandPayload: structuredClone(row.command_payload),
      result: structuredClone(row.result),
      completedAt: row.completed_at instanceof Date ? row.completed_at.toISOString() : row.completed_at
    };
  }

  async save(receipt: CommandReceipt): Promise<void> {
    await this.database.query(
      `INSERT INTO storyhouse.command_receipts
        (tenant_id, command_id, command_type, command_payload, result, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [receipt.tenantId, receipt.commandId, receipt.commandType, JSON.stringify(receipt.commandPayload), JSON.stringify(receipt.result), receipt.completedAt]
    );
  }
}
