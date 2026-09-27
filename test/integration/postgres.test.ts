import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Pool } from 'pg';
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest';
import {
  FixedClock,
  PostgresCommandReceiptRepository,
  PostgresDurableCommandGateway,
  PostgresOutboxRepository,
  SequenceIdGenerator,
  createPostgresRepositories,
  migrate,
  money,
  type AssetId,
  type Brand,
  type BrandId,
  type CommandId,
  type Creator,
  type CreatorId,
  type IdGenerator,
  type TenantId
} from '../../src/index.js';

const connectionString = process.env['DATABASE_URL'];
if (connectionString === undefined) throw new Error('DATABASE_URL is required for integration tests');

const pool = new Pool({ connectionString });
const tenantA = 'tenant_postgres_a' as TenantId;
const tenantB = 'tenant_postgres_b' as TenantId;
const clock = new FixedClock(new Date('2026-04-01T12:00:00.000Z'));
let firstMigrationRun: readonly string[] = [];
let commandNumber = 1;
const nextCommand = (): CommandId => `postgres_command_${commandNumber++}` as CommandId;
const insightGenerator = {
  generate(observations: readonly unknown[]) {
    return Promise.resolve({
      finding: `${observations.length} fictional observation supports concise tutorials`,
      recommendation: 'Produce two more concise tutorials',
      confidence: 0.84
    });
  }
};
interface CountRow { readonly count: string }

function gateway(ids?: IdGenerator): PostgresDurableCommandGateway {
  return new PostgresDurableCommandGateway({ pool, clock, insightGenerator, ...(ids === undefined ? {} : { ids }) });
}

beforeAll(async () => {
  const database = await pool.query<{ readonly current_database: string }>('SELECT current_database()');
  if (!database.rows[0]?.current_database.endsWith('_test')) throw new Error('Integration tests require a database name ending in _test');
  await pool.query('DROP SCHEMA IF EXISTS storyhouse CASCADE');
  firstMigrationRun = await migrate(pool);
});

beforeEach(async () => {
  await pool.query(`
    TRUNCATE
      storyhouse.brands,
      storyhouse.strategies,
      storyhouse.campaigns,
      storyhouse.content_items,
      storyhouse.approval_requests,
      storyhouse.media_assets,
      storyhouse.publication_intents,
      storyhouse.performance_observations,
      storyhouse.insights,
      storyhouse.creators,
      storyhouse.engagements,
      storyhouse.invoices,
      storyhouse.marketing_experiments,
      storyhouse.conversion_events,
      storyhouse.marketing_spend,
      storyhouse.marketing_plans,
      storyhouse.command_receipts,
      storyhouse.outbox_events
    CASCADE
  `);
});

afterAll(async () => { await pool.end(); });

describe('Postgres persistence', () => {
  it('applies ordered migrations to an empty database and is repeatable', async () => {
    expect(firstMigrationRun).toEqual(['001_initial_storyhouse.sql', '002_marketing_growth.sql']);
    await expect(migrate(pool)).resolves.toEqual([]);
    const tables = await pool.query<{ readonly table_name: string }>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'storyhouse' ORDER BY table_name`
    );
    expect(tables.rows.map((row) => row.table_name)).toEqual(expect.arrayContaining([
      'brands', 'strategies', 'campaigns', 'content_items', 'approval_requests', 'media_assets',
      'publication_intents', 'performance_observations', 'insights', 'creators', 'engagements',
      'invoices', 'command_receipts', 'outbox_events', 'schema_migrations'
      , 'marketing_plans', 'marketing_experiments', 'conversion_events', 'marketing_spend'
    ]));
    const ledger = await pool.query<{ readonly checksum: string }>(
      `SELECT checksum FROM storyhouse.schema_migrations WHERE name = '001_initial_storyhouse.sql'`
    );
    expect(ledger.rows[0]?.checksum).toMatch(/^[0-9a-f]{64}$/);
    const marketingLedger = await pool.query<{ readonly checksum: string }>(
      `SELECT checksum FROM storyhouse.schema_migrations WHERE name = '002_marketing_growth.sql'`
    );
    expect(marketingLedger.rows[0]?.checksum).toMatch(/^[0-9a-f]{64}$/);
    const schema = await pool.query<{ readonly public_access: boolean }>(`
      SELECT EXISTS (
        SELECT 1
        FROM aclexplode(COALESCE(nspacl, acldefault('n', nspowner)))
        WHERE grantee = 0 AND privilege_type IN ('USAGE', 'CREATE')
      ) AS public_access
      FROM pg_namespace
      WHERE nspname = 'storyhouse'
    `);
    expect(schema.rows[0]?.public_access).toBe(false);
  });

  it('rejects an applied migration whose contents have drifted', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'storyhouse-migrations-'));
    try {
      const name = '001_initial_storyhouse.sql';
      const sql = await readFile(new URL(`../../db/migrations/${name}`, import.meta.url), 'utf8');
      await writeFile(join(directory, name), `${sql}\n-- changed after application\n`);
      await expect(migrate(pool, directory)).rejects.toThrow(`Migration checksum mismatch: ${name}`);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('round-trips representative aggregates without losing domain payloads', async () => {
    const repositories = createPostgresRepositories(pool);
    const brand: Brand = {
      id: 'brand_roundtrip' as BrandId,
      tenantId: tenantA,
      organizationName: 'Lantern Field Studio',
      name: 'Moss & Meteor',
      profile: { purpose: 'Teach fictional fieldcraft.', audiences: ['curious makers'], voice: ['grounded'], objectives: ['learn'], constraints: ['fiction only'], platforms: ['video'] },
      createdAt: '2026-04-01T12:00:00.000Z'
    };
    const asset = {
      id: 'asset_roundtrip' as AssetId,
      tenantId: tenantA,
      name: 'Fictional field guide cover',
      kind: 'image' as const,
      versions: [{ version: 1, locator: 'local://fictional-cover-v1', mediaType: 'image/png', createdAt: '2026-04-01T12:00:00.000Z' }],
      rights: { owner: 'Lantern Field Studio', territories: ['US'], startsAt: '2026-04-01T00:00:00.000Z' },
      contentIds: [],
      campaignIds: []
    };
    const creator: Creator = {
      id: 'creator_roundtrip' as CreatorId,
      tenantId: tenantA,
      displayName: 'Avery Finch',
      specialties: ['fictional fieldcraft'],
      rates: [{ service: 'short video', rate: money(45_000, 'USD') }],
      assignments: []
    };
    await repositories.brands.save(brand);
    await repositories.assets.save(asset);
    await repositories.creators.save(creator);
    expect(await repositories.brands.get(tenantA, brand.id)).toEqual(brand);
    expect(await repositories.assets.get(tenantA, asset.id)).toEqual(asset);
    expect(await repositories.creators.get(tenantA, creator.id)).toEqual(creator);
  });

  it('prevents cross-tenant reads and lists through repository APIs', async () => {
    const repositories = createPostgresRepositories(pool);
    const brand: Brand = {
      id: 'brand_tenant_guard' as BrandId,
      tenantId: tenantA,
      organizationName: 'Northwind Fiction Lab',
      name: 'Paper Comet',
      profile: { purpose: 'Test boundaries.', audiences: ['testers'], voice: ['clear'], objectives: ['isolate'], constraints: [], platforms: [] },
      createdAt: '2026-04-01T12:00:00.000Z'
    };
    await repositories.brands.save(brand);
    expect(await repositories.brands.get(tenantB, brand.id)).toBeUndefined();
    expect(await repositories.brands.list(tenantB)).toEqual([]);
    expect(await repositories.brands.list(tenantA)).toEqual([brand]);
  });

  it('replays a durable receipt from a new gateway without rerunning the command', async () => {
    const command = {
      commandId: 'command_replay' as CommandId,
      tenantId: tenantA,
      type: 'brand.onboard' as const,
      payload: {
        organizationName: 'Copper Kite Cooperative',
        name: 'Cloudberry Press',
        profile: { purpose: 'Publish fictional guides.', audiences: ['readers'], voice: ['bright'], objectives: ['reach'], constraints: [], platforms: ['newsletter'] }
      }
    };
    const first = await gateway(new SequenceIdGenerator()).execute(command);
    const replayed = await gateway(new SequenceIdGenerator()).execute(command);
    expect(replayed).toEqual(first);
    expect((await createPostgresRepositories(pool).brands.list(tenantA))).toHaveLength(1);
    expect(Number((await pool.query<CountRow>('SELECT count(*) FROM storyhouse.command_receipts')).rows[0]?.count)).toBe(1);
    expect(Number((await pool.query<CountRow>('SELECT count(*) FROM storyhouse.outbox_events')).rows[0]?.count)).toBe(1);
  });

  it('uses restart-safe default IDs across new gateway instances', async () => {
    const first = await gateway().execute({
      commandId: 'command_default_ids_one' as CommandId,
      tenantId: tenantA,
      type: 'brand.onboard',
      payload: {
        organizationName: 'Silver Heron Workshop',
        name: 'Meadow Static',
        profile: { purpose: 'Verify durable IDs.', audiences: ['operators'], voice: ['clear'], objectives: ['verify'], constraints: [], platforms: [] }
      }
    });
    const second = await gateway().execute({
      commandId: 'command_default_ids_two' as CommandId,
      tenantId: tenantA,
      type: 'brand.onboard',
      payload: {
        organizationName: 'Juniper Signal House',
        name: 'Paper Aurora',
        profile: { purpose: 'Verify restart safety.', audiences: ['operators'], voice: ['warm'], objectives: ['verify'], constraints: [], platforms: [] }
      }
    });
    expect(first.id).not.toBe(second.id);
    expect(first.id).toMatch(/^brand_[0-9a-f-]{36}$/);
    expect(second.id).toMatch(/^brand_[0-9a-f-]{36}$/);
    expect(await createPostgresRepositories(pool).brands.list(tenantA)).toHaveLength(2);
    const events = await new PostgresOutboxRepository(pool).listPending(tenantA);
    expect(new Set(events.map((event) => event.id)).size).toBe(2);
  });

  it('rejects a replay with the same command type but a different payload without side effects', async () => {
    const commandId = 'command_payload_conflict' as CommandId;
    const original = {
      commandId,
      tenantId: tenantA,
      type: 'brand.onboard' as const,
      payload: {
        organizationName: 'Quiet Kestrel Cooperative',
        name: 'Amber Almanac',
        profile: { purpose: 'Prove strict replay identity.', audiences: ['readers'], voice: ['calm'], objectives: ['trust'], constraints: [], platforms: ['newsletter'] }
      }
    };
    const result = await gateway(new SequenceIdGenerator()).execute(original);
    await expect(gateway(new SequenceIdGenerator()).execute({
      ...original,
      payload: { ...original.payload, name: 'Different Almanac' }
    })).rejects.toMatchObject({ code: 'CONFLICT' });
    expect(await createPostgresRepositories(pool).brands.list(tenantA)).toEqual([result]);
    expect(Number((await pool.query<CountRow>('SELECT count(*) FROM storyhouse.command_receipts')).rows[0]?.count)).toBe(1);
    expect(Number((await pool.query<CountRow>('SELECT count(*) FROM storyhouse.outbox_events')).rows[0]?.count)).toBe(1);
  });

  it('serializes concurrent transitions of the same aggregate', async () => {
    const setup = gateway(new SequenceIdGenerator());
    const brand = await setup.execute({
      commandId: 'command_concurrency_brand' as CommandId,
      tenantId: tenantA,
      type: 'brand.onboard',
      payload: {
        organizationName: 'Blue Wren Assembly',
        name: 'Cedar Frequency',
        profile: { purpose: 'Exercise concurrency.', audiences: ['makers'], voice: ['direct'], objectives: ['verify'], constraints: [], platforms: ['video'] }
      }
    });
    const draft = await setup.execute({
      commandId: 'command_concurrency_strategy' as CommandId,
      tenantId: tenantA,
      type: 'strategy.create',
      payload: { brandId: brand.id, version: 1, goals: ['verify'], pillars: ['safe transitions'], channels: [], kpis: [] }
    });
    const strategy = await setup.execute({
      commandId: 'command_concurrency_activate' as CommandId,
      tenantId: tenantA,
      type: 'strategy.activate',
      payload: { strategyId: draft.id }
    });
    const campaign = await setup.execute({
      commandId: 'command_concurrency_campaign' as CommandId,
      tenantId: tenantA,
      type: 'campaign.create',
      payload: {
        brandId: brand.id,
        strategyId: strategy.id,
        name: 'Concurrent Finch',
        goals: ['verify'],
        startAt: '2026-04-02T00:00:00.000Z',
        endAt: '2026-04-30T00:00:00.000Z',
        budget: money(100_000, 'USD'),
        channels: ['video'],
        deliverables: ['short'],
        assigneeIds: []
      }
    });
    const content = await setup.execute({
      commandId: 'command_concurrency_content' as CommandId,
      tenantId: tenantA,
      type: 'content.create_brief',
      payload: {
        campaignId: campaign.id,
        title: 'Fold a fictional field map',
        idea: 'Demonstrate one safe transition.',
        hooks: ['Watch the fold.'],
        brief: 'A short fictional tutorial.',
        cta: 'Save the map.'
      }
    });
    const commandIds = ['command_concurrency_advance_a', 'command_concurrency_advance_b'] as const;
    const attempts = await Promise.allSettled(commandIds.map((commandId) => gateway().execute({
      commandId: commandId as CommandId,
      tenantId: tenantA,
      type: 'content.advance',
      payload: { contentId: content.id, to: 'script' }
    })));
    expect(attempts.filter((attempt) => attempt.status === 'fulfilled')).toHaveLength(1);
    expect(attempts.filter((attempt) => attempt.status === 'rejected')).toHaveLength(1);
    expect((await createPostgresRepositories(pool).content.get(tenantA, content.id))?.state).toBe('script');
    const receipts = await pool.query<{ readonly command_id: string }>(
      `SELECT command_id
       FROM storyhouse.command_receipts
       WHERE tenant_id = $1 AND command_id = ANY($2::text[])`,
      [tenantA, commandIds]
    );
    expect(receipts.rows).toHaveLength(1);
    expect(commandIds).toContain(receipts.rows[0]?.command_id);
    const events = await pool.query<CountRow>(
      `SELECT count(*)
       FROM storyhouse.outbox_events
       WHERE tenant_id = $1 AND aggregate_id = $2 AND event_type = 'content.advanced'`,
      [tenantA, content.id]
    );
    expect(Number(events.rows[0]?.count)).toBe(1);
  });

  it('rolls back aggregate changes, receipt, and new outbox records on a late failure', async () => {
    await pool.query(
      `INSERT INTO storyhouse.outbox_events
        (id, tenant_id, aggregate_id, event_type, payload, occurred_at)
       VALUES ('event_duplicate', $1, 'existing', 'test.seeded', '{}', '2026-04-01T00:00:00.000Z')`,
      [tenantA]
    );
    const ids: IdGenerator = { next(prefix) { return prefix === 'event' ? 'event_duplicate' : `${prefix}_rolled_back`; } };
    const commandId = 'command_rollback' as CommandId;
    await expect(gateway(ids).execute({
      commandId,
      tenantId: tenantA,
      type: 'brand.onboard',
      payload: {
        organizationName: 'Fictional Failure Works',
        name: 'Rollback Robin',
        profile: { purpose: 'Exercise rollback.', audiences: ['testers'], voice: ['plain'], objectives: ['verify'], constraints: [], platforms: [] }
      }
    })).rejects.toThrow();
    expect(await createPostgresRepositories(pool).brands.get(tenantA, 'brand_rolled_back' as BrandId)).toBeUndefined();
    expect(await new PostgresCommandReceiptRepository(pool).get(tenantA, commandId)).toBeUndefined();
    expect(Number((await pool.query<CountRow>('SELECT count(*) FROM storyhouse.outbox_events')).rows[0]?.count)).toBe(1);
  });

  it('writes successful aggregate, receipt, and outbox state together and exposes dispatch state', async () => {
    const result = await gateway().execute({
      commandId: 'command_atomic_success' as CommandId,
      tenantId: tenantA,
      type: 'brand.onboard',
      payload: {
        organizationName: 'Moonlit Anvil Guild',
        name: 'Fern Signal',
        profile: { purpose: 'Verify atomic success.', audiences: ['operators'], voice: ['direct'], objectives: ['verify'], constraints: [], platforms: [] }
      }
    });
    expect(await createPostgresRepositories(pool).brands.get(tenantA, result.id)).toEqual(result);
    expect(await new PostgresCommandReceiptRepository(pool).get(tenantA, 'command_atomic_success' as CommandId)).toBeDefined();
    const outbox = new PostgresOutboxRepository(pool);
    const pending = await outbox.listPending(tenantA);
    expect(pending.map((event) => event.type)).toEqual(['brand.onboarded']);
    const event = pending[0];
    expect(event).toBeDefined();
    if (event === undefined) throw new Error('Expected an outbox event');
    await expect(outbox.markFailed(tenantB, event.id, 'cross-tenant attempt')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect((await outbox.listPending(tenantA))[0]).toMatchObject({ attempts: 0 });
    await expect(outbox.markDispatched(tenantA, 'missing_event', '2026-04-01T12:29:00.000Z')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await outbox.markFailed(tenantA, event.id, 'fictional dispatch failure');
    expect((await outbox.listPending(tenantA))[0]).toMatchObject({ attempts: 1, lastError: 'fictional dispatch failure' });
    await outbox.markDispatched(tenantA, event.id, '2026-04-01T12:30:00.000Z');
    expect(await outbox.listPending(tenantA)).toEqual([]);
  });

  it('runs the complete typed command golden path with correct economics', async () => {
    const durable = gateway(new SequenceIdGenerator());
    const brand = await durable.execute({
      commandId: nextCommand(), tenantId: tenantA, type: 'brand.onboard',
      payload: { organizationName: 'Fable Loom Cooperative', name: 'Thistle Current', profile: { purpose: 'Share fictional maker stories.', audiences: ['makers'], voice: ['warm'], objectives: ['qualified reach'], constraints: ['no real endorsements'], platforms: ['video'] } }
    });
    const draft = await durable.execute({
      commandId: nextCommand(), tenantId: tenantA, type: 'strategy.create',
      payload: { brandId: brand.id, version: 1, goals: ['qualified reach'], pillars: ['practical craft'], channels: [{ channel: 'video', role: 'education', cadencePerWeek: 2 }], kpis: [{ metric: 'completion_rate', target: 0.5, period: 'month' }] }
    });
    const strategy = await durable.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'strategy.activate', payload: { strategyId: draft.id } });
    const campaign = await durable.execute({
      commandId: nextCommand(), tenantId: tenantA, type: 'campaign.create',
      payload: { brandId: brand.id, strategyId: strategy.id, name: 'Fictional Maker Month', goals: ['teach'], startAt: '2026-04-02T00:00:00.000Z', endAt: '2026-05-01T00:00:00.000Z', budget: money(300_000, 'USD'), channels: ['video'], deliverables: ['short tutorial'], assigneeIds: [] }
    });
    let content = await durable.execute({
      commandId: nextCommand(), tenantId: tenantA, type: 'content.create_brief',
      payload: { campaignId: campaign.id, title: 'Build a paper observatory', idea: 'Teach a fictional tabletop build.', hooks: ['Start with one sheet.'], brief: 'A concise fictional walkthrough.', cta: 'Save the pattern.', metadata: { format: 'vertical' } }
    });
    for (const to of ['script', 'production', 'edit', 'qa', 'review'] as const) {
      content = await durable.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'content.advance', payload: { contentId: content.id, to } });
    }
    const approval = await durable.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'approval.request', payload: { contentId: content.id, requestedBy: 'fictional-producer', reviewer: 'fictional-brand-lead' } });
    await durable.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'approval.decide', payload: { approvalId: approval.id, decision: 'approved', actor: 'fictional-brand-lead' } });
    const publication = await durable.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'publication.schedule', payload: { contentId: content.id, channel: 'fictional-video', scheduledAt: '2026-04-10T16:00:00.000Z', variant: { caption: 'Build along.' } } });
    await durable.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'publication.record_receipt', payload: { publicationId: publication.id, receipt: { externalId: 'fictional-post-804', publishedAt: '2026-04-10T16:00:00.000Z' } } });
    const observation = await durable.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'analytics.ingest_metrics', payload: { publicationId: publication.id, windowStart: '2026-04-10T16:00:00.000Z', windowEnd: '2026-04-17T16:00:00.000Z', metrics: [{ name: 'views', value: 2400, unit: 'count' }, { name: 'completion_rate', value: 0.58, unit: 'ratio' }] } });
    const insight = await durable.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'learning.generate_insight', payload: { observationIds: [observation.id] } });
    const commerce = await durable.execute({
      commandId: nextCommand(), tenantId: tenantA, type: 'commerce.create_engagement',
      payload: { campaignIds: [campaign.id], kind: 'project', package: { code: 'fictional-sprint', name: 'Fictional Story Sprint', price: money(900_000, 'USD'), deliverables: ['strategy', 'short tutorial'] }, contractedRevenue: money(900_000, 'USD'), costs: [{ category: 'production', description: 'Fictional production', amount: money(250_000, 'USD') }], creatorPayouts: [{ creatorId: 'fictional-creator-12', amount: money(150_000, 'USD'), status: 'planned' }], startsAt: campaign.startAt, endsAt: campaign.endAt }
    });

    expect(insight.observationIds).toEqual([observation.id]);
    expect(commerce.economics).toMatchObject({
      revenue: money(900_000, 'USD'),
      costs: money(400_000, 'USD'),
      contributionMargin: money(500_000, 'USD'),
      marginRatio: 5 / 9
    });
    expect((await createPostgresRepositories(pool).content.get(tenantA, content.id))?.state).toBe('published');
    const receiptCount = Number((await pool.query<CountRow>('SELECT count(*) FROM storyhouse.command_receipts WHERE tenant_id = $1', [tenantA])).rows[0]?.count);
    const eventCount = Number((await pool.query<CountRow>('SELECT count(*) FROM storyhouse.outbox_events WHERE tenant_id = $1', [tenantA])).rows[0]?.count);
    expect(receiptCount).toBe(17);
    expect(eventCount).toBe(17);
  });

  it('runs the durable marketing path with tenant-safe round trips and atomic receipts/outbox events', async () => {
    const durable = gateway(new SequenceIdGenerator());
    const brand = await durable.execute({
      commandId: nextCommand(), tenantId: tenantA, type: 'brand.onboard',
      payload: { organizationName: 'Fictional Orchard Guild', name: 'Signal Finch', profile: { purpose: 'Teach fictional orchard craft.', audiences: ['city growers'], voice: ['useful'], objectives: ['qualified bookings'], constraints: [], platforms: ['video', 'email'] } }
    });
    const draft = await durable.execute({
      commandId: nextCommand(), tenantId: tenantA, type: 'strategy.create',
      payload: { brandId: brand.id, version: 1, goals: ['qualified bookings'], pillars: ['orchard craft'], channels: [{ channel: 'video', role: 'teach', cadencePerWeek: 2 }], kpis: [{ metric: 'bookings', target: 12, period: 'month' }] }
    });
    const strategy = await durable.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'strategy.activate', payload: { strategyId: draft.id } });
    const campaign = await durable.execute({
      commandId: nextCommand(), tenantId: tenantA, type: 'campaign.create',
      payload: { brandId: brand.id, strategyId: strategy.id, name: 'Fictional Orchard Sessions', goals: ['teach and convert'], startAt: '2026-04-02T00:00:00.000Z', endAt: '2026-05-01T00:00:00.000Z', budget: money(150_000, 'USD'), channels: ['video', 'email'], deliverables: ['field film'], assigneeIds: [] }
    });
    const plan = await durable.execute({
      commandId: nextCommand(), tenantId: tenantA, type: 'marketing.create_plan',
      payload: {
        brandId: brand.id, strategyId: strategy.id, name: 'Orchard workshop growth', businessOutcome: 'Earn qualified workshop bookings', positioning: 'Practical orchard lessons for city growers',
        offer: { name: 'Orchard session', promise: 'Learn one seasonal skill in an afternoon', cta: 'Reserve a session' },
        audienceSegments: [{ id: 'city_growers', name: 'City growers', description: 'New growers with small plots', need: 'Confident seasonal guidance' }],
        funnelStages: [{ stage: 'awareness', objective: 'Earn relevant attention', cta: 'Watch the field lesson', channels: ['organic_social', 'creator'] }, { stage: 'conversion', objective: 'Earn reservations', cta: 'Reserve a session', channels: ['email', 'web'] }],
        conversionGoals: [{ name: 'Qualified growers', eventType: 'qualified_lead', target: 20 }, { name: 'Workshop purchases', eventType: 'purchase', target: 8, value: money(12_500, 'USD') }]
      }
    });
    const active = await durable.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'marketing.activate_plan', payload: { marketingPlanId: plan.id } });
    const linked = await durable.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'marketing.link_campaign', payload: { marketingPlanId: plan.id, campaignId: campaign.id } });
    const spend = await durable.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'marketing.record_spend', payload: { marketingPlanId: plan.id, campaignId: campaign.id, channel: 'paid_social', amount: money(25_000, 'USD'), occurredAt: '2026-04-08T00:00:00.000Z', note: 'Fictional launch placement' } });
    const conversion = await durable.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'marketing.record_conversion', payload: { marketingPlanId: plan.id, campaignId: campaign.id, eventType: 'purchase', channel: 'paid_social', source: 'fictional-orchard-film', value: money(50_000, 'USD'), occurredAt: '2026-04-09T00:00:00.000Z', metadata: { offer: 'orchard-session' } } });
    const experiment = await durable.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'marketing.create_experiment', payload: { marketingPlanId: plan.id, campaignId: campaign.id, name: 'Workshop CTA framing', hypothesis: 'Seasonal specificity earns more bookings', variants: [{ id: 'season', label: 'Season', description: 'Name the seasonal skill' }, { id: 'place', label: 'Place', description: 'Name the orchard setting' }], primaryMetric: 'purchase_rate' } });
    await durable.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'marketing.start_experiment', payload: { marketingExperimentId: experiment.id } });
    const completed = await durable.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'marketing.complete_experiment', payload: { marketingExperimentId: experiment.id, winnerVariantId: 'season' } });

    const repositories = createPostgresRepositories(pool);
    expect(await repositories.marketingPlans.get(tenantA, plan.id)).toEqual(linked);
    expect(await repositories.marketingPlans.get(tenantB, plan.id)).toBeUndefined();
    expect(await repositories.marketingExperiments.get(tenantA, experiment.id)).toEqual(completed);
    expect(await repositories.marketingExperiments.get(tenantB, experiment.id)).toBeUndefined();
    expect(await repositories.conversionEvents.get(tenantA, conversion.id)).toEqual(conversion);
    expect(await repositories.conversionEvents.get(tenantB, conversion.id)).toBeUndefined();
    expect(await repositories.marketingSpend.get(tenantA, spend.id)).toEqual(spend);
    expect(await repositories.marketingSpend.get(tenantB, spend.id)).toBeUndefined();
    expect(active.status).toBe('active');
    expect(completed).toMatchObject({ status: 'completed', winnerVariantId: 'season' });
    expect(Number((await pool.query<CountRow>(`SELECT count(*) FROM storyhouse.command_receipts WHERE tenant_id = $1`, [tenantA])).rows[0]?.count)).toBe(12);
    expect(Number((await pool.query<CountRow>(`SELECT count(*) FROM storyhouse.outbox_events WHERE tenant_id = $1`, [tenantA])).rows[0]?.count)).toBe(12);
  });

  it('rolls back a marketing aggregate, receipt, and outbox event on late failure', async () => {
    const setup = gateway(new SequenceIdGenerator());
    const brand = await setup.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'brand.onboard', payload: { organizationName: 'Fictional Lantern Cooperative', name: 'Moss Current', profile: { purpose: 'Test marketing rollback.', audiences: ['testers'], voice: ['plain'], objectives: ['verify'], constraints: [], platforms: [] } } });
    const draft = await setup.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'strategy.create', payload: { brandId: brand.id, version: 1, goals: ['verify'], pillars: ['safe growth'], channels: [], kpis: [] } });
    const plan = await setup.execute({ commandId: nextCommand(), tenantId: tenantA, type: 'marketing.create_plan', payload: { brandId: brand.id, strategyId: draft.id, name: 'Rollback growth', businessOutcome: 'Verify atomic rollback', positioning: 'Safe growth records', offer: { name: 'Test offer', promise: 'Atomic behavior', cta: 'Verify' }, audienceSegments: [{ id: 'testers', name: 'Testers', description: 'Fictional testers', need: 'Safe transactions' }], funnelStages: [{ stage: 'conversion', objective: 'Verify', cta: 'Check', channels: ['web'] }], conversionGoals: [{ name: 'Checks', eventType: 'custom' }] } });
    await pool.query(`INSERT INTO storyhouse.outbox_events (id, tenant_id, aggregate_id, event_type, payload, occurred_at) VALUES ('marketing_event_duplicate', $1, 'existing', 'test.seeded', '{}', '2026-04-01T00:00:00.000Z')`, [tenantA]);
    const ids: IdGenerator = { next(prefix) { return prefix === 'event' ? 'marketing_event_duplicate' : `${prefix}_rolled_back`; } };
    const commandId = 'marketing_command_rollback' as CommandId;
    const beforeOutbox = Number((await pool.query<CountRow>('SELECT count(*) FROM storyhouse.outbox_events')).rows[0]?.count);
    await expect(gateway(ids).execute({ commandId, tenantId: tenantA, type: 'marketing.record_spend', payload: { marketingPlanId: plan.id, channel: 'web', amount: money(1_000, 'USD'), occurredAt: '2026-04-11T00:00:00.000Z' } })).rejects.toThrow();
    expect(await createPostgresRepositories(pool).marketingSpend.get(tenantA, 'marketing_spend_rolled_back' as never)).toBeUndefined();
    expect(await new PostgresCommandReceiptRepository(pool).get(tenantA, commandId)).toBeUndefined();
    expect(Number((await pool.query<CountRow>('SELECT count(*) FROM storyhouse.outbox_events')).rows[0]?.count)).toBe(beforeOutbox);
  });
});
