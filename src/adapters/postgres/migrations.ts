import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Pool } from 'pg';

const migrationName = /^\d+_[a-z0-9_]+\.sql$/;

export async function migrate(pool: Pool, directory = resolve(process.cwd(), 'db/migrations')): Promise<readonly string[]> {
  const client = await pool.connect();
  const applied: string[] = [];
  try {
    await client.query('SELECT pg_advisory_lock(hashtext($1))', ['storyhouse:migrations']);
    await client.query('BEGIN');
    try {
      await client.query('CREATE SCHEMA IF NOT EXISTS storyhouse');
      await client.query('REVOKE ALL ON SCHEMA storyhouse FROM PUBLIC');
      await client.query(`
        CREATE TABLE IF NOT EXISTS storyhouse.schema_migrations (
          name text PRIMARY KEY,
          checksum text NOT NULL CHECK (checksum ~ '^[0-9a-f]{64}$'),
          applied_at timestamptz NOT NULL DEFAULT now()
        )
      `);
      await client.query('COMMIT');
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      throw error;
    }
    const files = (await readdir(directory)).filter((name) => migrationName.test(name)).sort();
    for (const name of files) {
      const sql = await readFile(resolve(directory, name), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const existing = await client.query<{ readonly checksum: string }>(
        'SELECT checksum FROM storyhouse.schema_migrations WHERE name = $1',
        [name]
      );
      const recorded = existing.rows[0];
      if (recorded !== undefined) {
        if (recorded.checksum !== checksum) throw new Error(`Migration checksum mismatch: ${name}`);
        continue;
      }
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO storyhouse.schema_migrations (name, checksum) VALUES ($1, $2)', [name, checksum]);
        await client.query('COMMIT');
        applied.push(name);
      } catch (error: unknown) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock(hashtext($1))', ['storyhouse:migrations']).catch(() => undefined);
    client.release();
  }
  return applied;
}
