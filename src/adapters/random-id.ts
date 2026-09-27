import { randomUUID } from 'node:crypto';
import type { IdGenerator } from '../ports/index.js';

export class RandomUuidIdGenerator implements IdGenerator {
  next(prefix: string): string { return `${prefix}_${randomUUID()}`; }
}
