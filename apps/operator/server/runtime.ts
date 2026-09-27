import 'server-only';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import {
  OperatorQueryService,
  PostgresDurableCommandGateway,
  PostgresOutboxRepository,
  RuleBasedInsightGenerator,
  SystemClock,
  createPostgresRepositories,
  type CommandId,
  type StoryhouseCommand,
  type TenantId
} from 'hummingbird-storyhouse-core';

declare global {
  var storyhousePool: Pool | undefined;
}

function required(name: 'DATABASE_URL' | 'STORYHOUSE_TENANT_ID'): string {
  const value = process.env[name]?.trim();
  if (value === undefined || value === '') {
    throw new Error(`${name} is required. See apps/operator/README.md for local development commands.`);
  }
  return value;
}

export const tenantId = (): TenantId => required('STORYHOUSE_TENANT_ID') as TenantId;
export const tenantLabel = (): string => (process.env['STORYHOUSE_TENANT_ID']?.trim() || 'tenant not configured').replace('tenant_', '').replaceAll('_', ' ');

export function database(): Pool {
  const connectionString = required('DATABASE_URL');
  globalThis.storyhousePool ??= new Pool({ connectionString, max: 8 });
  return globalThis.storyhousePool;
}

const clock = new SystemClock();
const generator = new RuleBasedInsightGenerator();

export function queries(): OperatorQueryService {
  const pool = database();
  return new OperatorQueryService(createPostgresRepositories(pool), new PostgresOutboxRepository(pool), clock);
}

export function gateway(): PostgresDurableCommandGateway {
  return new PostgresDurableCommandGateway({ pool: database(), clock, insightGenerator: generator });
}

export function commandId(): CommandId {
  return `operator_${randomUUID()}` as CommandId;
}

export function execute<TCommand extends StoryhouseCommand>(command: TCommand) {
  return gateway().execute(command);
}
