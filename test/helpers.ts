import { FixedClock, InMemoryEventBus, SequenceIdGenerator, StoryhouseService, createInMemoryRepositories, type CommandId, type TenantId } from '../src/index.js';

export const tenantA = 'tenant_a' as TenantId;
export const tenantB = 'tenant_b' as TenantId;
let nextCommand = 1;
export const commandId = (): CommandId => `command_${nextCommand++}` as CommandId;

export function harness() {
  const repositories = createInMemoryRepositories();
  const events = new InMemoryEventBus();
  const service = new StoryhouseService({
    repositories, events, clock: new FixedClock(new Date('2026-01-01T12:00:00.000Z')), ids: new SequenceIdGenerator(),
    insightGenerator: { generate(observations) { return Promise.resolve({ finding: `${observations.length} observation supports short tutorials`, recommendation: 'Make two more short tutorials', confidence: 0.8 }); } }
  });
  return { service, repositories, events };
}

export async function campaignFixture() {
  const setup = harness();
  const brand = await setup.service.onboardBrand(commandId(), { tenantId: tenantA, organizationName: 'Fictional Works', name: 'Cedar & Finch', profile: { purpose: 'Help neighbors create.', audiences: ['local makers'], voice: ['warm'], objectives: ['awareness'], constraints: [], platforms: ['video'] } });
  const draft = await setup.service.createStrategy(commandId(), { tenantId: tenantA, brandId: brand.id, version: 1, goals: ['awareness'], pillars: ['making'], channels: [{ channel: 'video', role: 'teach', cadencePerWeek: 2 }], kpis: [{ metric: 'views', target: 1000, period: 'month' }] });
  const strategy = await setup.service.activateStrategy(commandId(), tenantA, draft.id);
  const campaign = await setup.service.createCampaign(commandId(), { tenantId: tenantA, brandId: brand.id, strategyId: strategy.id, name: 'Maker Month', goals: ['teach'], startAt: '2026-02-01T00:00:00.000Z', endAt: '2026-03-01T00:00:00.000Z', budget: { amount: 100_000, currency: 'USD' }, channels: ['video'], deliverables: ['short'], assigneeIds: [] });
  return { ...setup, brand, strategy, campaign };
}
