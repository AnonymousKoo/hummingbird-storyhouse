import type { Pool } from 'pg';
import { isDeepStrictEqual } from 'node:util';
import { StoryhouseCommandDispatcher, type CommandResult, type StoryhouseCommand } from '../../application/commands.js';
import { StoryhouseService } from '../../application/storyhouse.js';
import { RandomUuidIdGenerator } from '../random-id.js';
import type { InsightGenerator } from '../../domain/learning.js';
import { ConflictError, iso } from '../../domain/shared.js';
import type { Clock, IdGenerator } from '../../ports/index.js';
import { PostgresOutboxEventBus } from './outbox.js';
import { PostgresCommandReceiptRepository } from './receipts.js';
import { createPostgresRepositories } from './repositories.js';
import { PostgresUnitOfWork } from './unit-of-work.js';

export interface PostgresDurableCommandGatewayDependencies {
  readonly pool: Pool;
  readonly clock: Clock;
  readonly ids?: IdGenerator;
  readonly insightGenerator: InsightGenerator;
}

export class PostgresDurableCommandGateway {
  readonly #unitOfWork: PostgresUnitOfWork;
  readonly #ids: IdGenerator;

  constructor(private readonly dependencies: PostgresDurableCommandGatewayDependencies) {
    this.#unitOfWork = new PostgresUnitOfWork(dependencies.pool);
    this.#ids = dependencies.ids ?? new RandomUuidIdGenerator();
  }

  execute<TCommand extends StoryhouseCommand>(command: TCommand): Promise<CommandResult<TCommand>> {
    return this.#unitOfWork.transaction(async (client) => {
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [`${command.tenantId}:${command.commandId}`]);
      const receipts = new PostgresCommandReceiptRepository(client);
      const existing = await receipts.get(command.tenantId, command.commandId);
      if (existing !== undefined) {
        if (existing.commandType !== command.type || !isDeepStrictEqual(existing.commandPayload, command.payload)) {
          throw new ConflictError('Command ID was already used for a different command');
        }
        return structuredClone(existing.result) as CommandResult<TCommand>;
      }

      const service = new StoryhouseService({
        repositories: createPostgresRepositories(client, { lockReads: true }),
        events: new PostgresOutboxEventBus(client),
        clock: this.dependencies.clock,
        ids: this.#ids,
        insightGenerator: this.dependencies.insightGenerator
      });
      const result = await new StoryhouseCommandDispatcher(service).dispatch(command);
      await receipts.save({
        commandId: command.commandId,
        tenantId: command.tenantId,
        commandType: command.type,
        commandPayload: command.payload,
        result,
        completedAt: iso(this.dependencies.clock.now())
      });
      return result;
    });
  }
}
