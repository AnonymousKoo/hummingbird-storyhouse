import { InvalidTransitionError, invariant, nonEmpty, type BrandId, type StrategyId, type TenantId } from './shared.js';
import type { Repository } from '../ports/index.js';

export type StrategyStatus = 'draft' | 'active' | 'retired';
export interface KpiTarget { readonly metric: string; readonly target: number; readonly period: string }
export interface ChannelStrategy { readonly channel: string; readonly role: string; readonly cadencePerWeek: number }
export interface Strategy {
  readonly id: StrategyId; readonly tenantId: TenantId; readonly brandId: BrandId;
  readonly version: number; readonly goals: readonly string[]; readonly pillars: readonly string[];
  readonly channels: readonly ChannelStrategy[]; readonly kpis: readonly KpiTarget[];
  readonly status: StrategyStatus; readonly createdAt: string; readonly activatedAt?: string;
}
export function createStrategy(input: Strategy): Strategy {
  invariant(input.version > 0 && Number.isInteger(input.version), 'Strategy version must be a positive integer');
  invariant(input.goals.length > 0, 'Strategy needs a goal');
  invariant(input.pillars.length > 0, 'Strategy needs a content pillar');
  input.goals.forEach((goal) => nonEmpty(goal, 'Goal'));
  return structuredClone(input);
}
export function activateStrategy(strategy: Strategy, at: string): Strategy {
  if (strategy.status !== 'draft') throw new InvalidTransitionError(strategy.status, 'active');
  return { ...strategy, status: 'active', activatedAt: at };
}
export type StrategyRepository = Repository<Strategy>;
