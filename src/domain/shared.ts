export type Opaque<T, Name extends string> = T & { readonly __brand: Name };
export type TenantId = Opaque<string, 'TenantId'>;
export type BrandId = Opaque<string, 'BrandId'>;
export type StrategyId = Opaque<string, 'StrategyId'>;
export type CampaignId = Opaque<string, 'CampaignId'>;
export type ContentId = Opaque<string, 'ContentId'>;
export type ApprovalId = Opaque<string, 'ApprovalId'>;
export type AssetId = Opaque<string, 'AssetId'>;
export type PublicationId = Opaque<string, 'PublicationId'>;
export type ObservationId = Opaque<string, 'ObservationId'>;
export type InsightId = Opaque<string, 'InsightId'>;
export type CreatorId = Opaque<string, 'CreatorId'>;
export type EngagementId = Opaque<string, 'EngagementId'>;
export type InvoiceId = Opaque<string, 'InvoiceId'>;
export type MarketingPlanId = Opaque<string, 'MarketingPlanId'>;
export type MarketingExperimentId = Opaque<string, 'MarketingExperimentId'>;
export type ConversionEventId = Opaque<string, 'ConversionEventId'>;
export type MarketingSpendId = Opaque<string, 'MarketingSpendId'>;
export type CommandId = Opaque<string, 'CommandId'>;

export abstract class DomainError extends Error {
  abstract readonly code: string;
}

export class InvariantError extends DomainError {
  readonly code = 'INVARIANT_VIOLATION';
}

export class InvalidTransitionError extends DomainError {
  readonly code = 'INVALID_TRANSITION';
  constructor(from: string, to: string) {
    super(`Cannot transition from ${from} to ${to}`);
  }
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  constructor(kind: string) { super(`${kind} was not found`); }
}

export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
}

export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new InvariantError(message);
}

export function nonEmpty(value: string, field: string): string {
  const result = value.trim();
  invariant(result.length > 0, `${field} must not be empty`);
  return result;
}

export function iso(value: Date): string {
  invariant(!Number.isNaN(value.getTime()), 'Timestamp must be valid');
  return value.toISOString();
}

export interface Money { readonly amount: number; readonly currency: string }

export function money(amount: number, currency: string): Money {
  invariant(Number.isSafeInteger(amount), 'Money amount must be an integer in minor units');
  const normalized = currency.trim().toUpperCase();
  invariant(/^[A-Z]{3}$/.test(normalized), 'Currency must be a three-letter code');
  return { amount, currency: normalized };
}

export function addMoney(a: Money, b: Money): Money {
  invariant(a.currency === b.currency, 'Currencies must match');
  return money(a.amount + b.amount, a.currency);
}

export interface DomainEvent<T = unknown> {
  readonly id: string;
  readonly type: string;
  readonly tenantId: TenantId;
  readonly aggregateId: string;
  readonly occurredAt: string;
  readonly payload: T;
}
