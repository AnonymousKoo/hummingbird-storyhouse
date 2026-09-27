import { InMemoryEventBus, FixedClock, SequenceIdGenerator, StoryhouseService, createInMemoryRepositories, money, type CommandId, type TenantId } from './index.js';

const tenantId = 'tenant_demo' as TenantId;
let command = 1;
const commandId = (): CommandId => `command_${command++}` as CommandId;
const repositories = createInMemoryRepositories();
const events = new InMemoryEventBus();
const service = new StoryhouseService({
  repositories,
  events,
  clock: new FixedClock(new Date('2026-01-05T14:00:00.000Z')),
  ids: new SequenceIdGenerator(),
  insightGenerator: { generate() { return Promise.resolve({ finding: 'Tutorial videos retain viewers.', recommendation: 'Increase the tutorial mix.', confidence: 0.86 }); } }
});

const brand = await service.onboardBrand(commandId(), { tenantId, organizationName: 'Northstar Collective', name: 'Juniper House', profile: { purpose: 'Make practical creativity accessible.', audiences: ['independent makers'], voice: ['warm', 'clear'], objectives: ['grow qualified reach'], constraints: ['no unsupported claims'], platforms: ['video'] } });
const draft = await service.createStrategy(commandId(), { tenantId, brandId: brand.id, version: 1, goals: ['grow meaningful reach'], pillars: ['practical craft'], channels: [{ channel: 'video', role: 'education', cadencePerWeek: 2 }], kpis: [{ metric: 'completion_rate', target: 0.45, period: 'quarter' }] });
const strategy = await service.activateStrategy(commandId(), tenantId, draft.id);
const campaign = await service.createCampaign(commandId(), { tenantId, brandId: brand.id, strategyId: strategy.id, name: 'Make It Visible', goals: ['teach one repeatable skill'], startAt: '2026-02-01T00:00:00.000Z', endAt: '2026-03-01T00:00:00.000Z', budget: money(500_000, 'USD'), channels: ['video'], deliverables: ['one short video'], assigneeIds: [] });
let content = await service.createContentBrief(commandId(), { tenantId, campaignId: campaign.id, title: 'Three-light setup', idea: 'Teach a simple lighting pattern.', hooks: ['Your window is already a key light.'], brief: 'A concise practical walkthrough.', cta: 'Save this setup.' });
for (const state of ['script', 'production', 'edit', 'qa', 'review'] as const) content = await service.advanceContent(commandId(), tenantId, content.id, state);
const approval = await service.requestApproval(commandId(), { tenantId, contentId: content.id, requestedBy: 'producer', reviewer: 'brand-lead' });
await service.decideApproval(commandId(), { tenantId, approvalId: approval.id, decision: 'approved', actor: 'brand-lead' });
const publication = await service.schedulePublication(commandId(), { tenantId, contentId: content.id, channel: 'video', scheduledAt: '2026-02-10T17:00:00.000Z' });
await service.recordPublicationReceipt(commandId(), tenantId, publication.id, { externalId: 'fictional-post-101', publishedAt: '2026-02-10T17:00:00.000Z' });
const observation = await service.ingestMetrics(commandId(), { tenantId, publicationId: publication.id, windowStart: '2026-02-10T17:00:00.000Z', windowEnd: '2026-02-17T17:00:00.000Z', metrics: [{ name: 'views', value: 18_400, unit: 'count' }, { name: 'completion_rate', value: 0.52, unit: 'ratio' }] });
const insight = await service.generateInsight(commandId(), tenantId, [observation.id]);
const { economics } = await service.createEngagement(commandId(), { tenantId, campaignIds: [campaign.id], kind: 'project', package: { code: 'story-sprint', name: 'Story Sprint', price: money(900_000, 'USD'), deliverables: ['strategy', 'video'] }, contractedRevenue: money(900_000, 'USD'), costs: [{ category: 'production', description: 'Production', amount: money(250_000, 'USD') }], creatorPayouts: [{ creatorId: 'creator_fictional', amount: money(150_000, 'USD'), status: 'planned' }], startsAt: campaign.startAt, endsAt: campaign.endAt });

console.log(JSON.stringify({ brand: brand.name, campaign: campaign.name, insight: insight.recommendation, contributionMarginMinor: economics.contributionMargin.amount, eventCount: events.events.length }, null, 2));
