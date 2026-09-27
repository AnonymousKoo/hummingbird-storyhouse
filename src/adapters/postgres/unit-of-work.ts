import type { Pool, PoolClient } from 'pg';
import type { UnitOfWork } from '../../ports/index.js';

export class PostgresUnitOfWork implements UnitOfWork<PoolClient> {
  constructor(private readonly pool: Pool) {}

  async transaction<TResult>(operation: (client: PoolClient) => Promise<TResult>): Promise<TResult> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      try {
        const result = await operation(client);
        await client.query('COMMIT');
        return result;
      } catch (error: unknown) {
        await client.query('ROLLBACK');
        throw error;
      }
    } finally {
      client.release();
    }
  }
}
