import { Pool } from 'pg';
import { migrate } from './migrations.js';

const connectionString = process.env['DATABASE_URL'];
if (connectionString === undefined || connectionString.trim() === '') throw new Error('DATABASE_URL is required');

const pool = new Pool({ connectionString });
try {
  const applied = await migrate(pool);
  console.log(applied.length === 0 ? 'Database is current.' : `Applied migrations: ${applied.join(', ')}`);
} finally {
  await pool.end();
}
