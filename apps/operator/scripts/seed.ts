import { Pool } from 'pg';
import {
  FixedClock,
  PostgresDurableCommandGateway,
  RuleBasedInsightGenerator,
  migrate,
  money,
  type CommandId,
  type ContentId,
  type IdGenerator,
  type StoryhouseCommand,
  type TenantId
} from '../../../src/index.js';

const connectionString = process.env['DATABASE_URL'];
const rawTenant = process.env['STORYHOUSE_TENANT_ID'];
if (connectionString === undefined || connectionString.trim() === '') throw new Error('DATABASE_URL is required');
if (rawTenant === undefined || rawTenant.trim() === '') throw new Error('STORYHOUSE_TENANT_ID is required');
const tenantId = rawTenant as TenantId;
const pool = new Pool({ connectionString });
const fixedNow = '2026-09-27T13:00:00.000Z';
class SeedIdGenerator implements IdGenerator {
  #next = 1;
  next(prefix: string): string { return `${prefix}_storyhouse_demo_${String(this.#next++).padStart(4, '0')}`; }
}
const gateway = new PostgresDurableCommandGateway({ pool, clock: new FixedClock(new Date(fixedNow)), ids: new SeedIdGenerator(), insightGenerator: new RuleBasedInsightGenerator() });
const cid = (name: string): CommandId => `seed_v1_${name}` as CommandId;
const run = <T extends StoryhouseCommand>(command: T) => gateway.execute(command);

async function advance(name: string, contentId: ContentId, states: readonly ('script' | 'production' | 'edit' | 'qa' | 'review')[]) {
  for (const state of states) await run({ commandId: cid(`${name}_${state}`), tenantId, type: 'content.advance', payload: { contentId, to: state } });
}

try {
  const database = await pool.query<{ readonly current_database: string }>('SELECT current_database()');
  const databaseName = database.rows[0]?.current_database ?? '';
  if (!databaseName.endsWith('_test') && !databaseName.endsWith('_dev')) throw new Error(`Seed refused: database "${databaseName}" must end in _test or _dev`);
  await migrate(pool);

  const ember = await run({
    commandId: cid('brand_ember'), tenantId, type: 'brand.onboard',
    payload: { organizationName: 'Ember & Orchard Cooperative', name: 'Ember & Orchard', profile: { purpose: 'Keep regional food memory alive through beautifully useful stories.', audiences: ['culture-first home cooks', 'independent food retailers'], voice: ['warm', 'specific', 'quietly joyful'], objectives: ['grow qualified awareness', 'earn saves and shares', 'support seasonal retail'], constraints: ['no health claims', 'credit every recipe keeper'], platforms: ['Instagram', 'YouTube', 'Newsletter'] } }
  });
  const emberDraft = await run({
    commandId: cid('strategy_ember'), tenantId, type: 'strategy.create',
    payload: { brandId: ember.id, version: 2, goals: ['Make regional food knowledge feel contemporary', 'Build a repeat viewing habit'], pillars: ['heirloom techniques', 'people behind the pantry', 'seasonal table rituals'], channels: [{ channel: 'Instagram', role: 'daily discovery', cadencePerWeek: 4 }, { channel: 'YouTube', role: 'deep instruction', cadencePerWeek: 1 }, { channel: 'Newsletter', role: 'retention', cadencePerWeek: 1 }], kpis: [{ metric: 'views', target: 80_000, period: 'month' }, { metric: 'completion_rate', target: 0.52, period: 'month' }] }
  });
  const emberStrategy = await run({ commandId: cid('strategy_ember_activate'), tenantId, type: 'strategy.activate', payload: { strategyId: emberDraft.id } });
  const tableCampaign = await run({
    commandId: cid('campaign_table'), tenantId, type: 'campaign.create',
    payload: { brandId: ember.id, strategyId: emberStrategy.id, name: 'The Table Remembers', goals: ['Build a recognizable seasonal editorial franchise', 'Increase high-intent saves'], startAt: '2026-09-01T00:00:00.000Z', endAt: '2026-11-30T23:59:59.000Z', budget: money(4_800_000, 'USD'), channels: ['Instagram', 'YouTube', 'Newsletter'], deliverables: ['8 short films', '2 field notes', '1 feature film'], assigneeIds: ['fictional-producer-mara'] }
  });

  const northstar = await run({
    commandId: cid('brand_northstar'), tenantId, type: 'brand.onboard',
    payload: { organizationName: 'Northstar Listening Rooms', name: 'Northstar Rooms', profile: { purpose: 'Create intimate places where emerging music and attentive audiences meet.', audiences: ['independent music listeners', 'touring artists', 'city culture explorers'], voice: ['intimate', 'observant', 'unhurried'], objectives: ['sell seasonal memberships', 'grow artist trust', 'document the rooms'], constraints: ['artist approval required', 'never publish unreleased music'], platforms: ['YouTube', 'TikTok', 'Newsletter'] } }
  });
  const northstarDraft = await run({
    commandId: cid('strategy_northstar'), tenantId, type: 'strategy.create',
    payload: { brandId: northstar.id, version: 1, goals: ['Turn live sessions into a durable editorial property', 'Increase member conversion'], pillars: ['before the doors', 'one-take sessions', 'listener field notes'], channels: [{ channel: 'YouTube', role: 'session home', cadencePerWeek: 1 }, { channel: 'TikTok', role: 'discovery', cadencePerWeek: 3 }, { channel: 'Newsletter', role: 'membership conversion', cadencePerWeek: 1 }], kpis: [{ metric: 'views', target: 120_000, period: 'month' }, { metric: 'completion_rate', target: 0.6, period: 'month' }] }
  });
  const northstarStrategy = await run({ commandId: cid('strategy_northstar_activate'), tenantId, type: 'strategy.activate', payload: { strategyId: northstarDraft.id } });
  const roomsCampaign = await run({
    commandId: cid('campaign_rooms'), tenantId, type: 'campaign.create',
    payload: { brandId: northstar.id, strategyId: northstarStrategy.id, name: 'Before the Doors', goals: ['Show the craft behind every room', 'Convert viewers into members'], startAt: '2026-09-15T00:00:00.000Z', endAt: '2026-12-15T23:59:59.000Z', budget: money(6_200_000, 'USD'), channels: ['YouTube', 'TikTok', 'Newsletter'], deliverables: ['6 session films', '12 vertical cuts', '3 artist letters'], assigneeIds: ['fictional-director-ellis'] }
  });

  const skillet = await run({ commandId: cid('content_skillet'), tenantId, type: 'content.create_brief', payload: { campaignId: tableCampaign.id, title: 'The Skillet That Stayed', idea: 'One cast-iron skillet traces the meals and hands of three generations.', hooks: ['Three generations. One well-seasoned pan.', 'This is what seventy years of supper looks like.'], brief: 'A tactile vertical film moving from worn iron to hands, heat, and a shared table. Let natural sound lead.', cta: 'Save this for the recipe keeper in your family.', metadata: { format: 'vertical film', duration: '00:48', owner: 'Mara Bell' } } });
  await advance('skillet', skillet.id, ['script', 'production', 'edit', 'qa', 'review']);
  const skilletApproval = await run({ commandId: cid('approval_skillet'), tenantId, type: 'approval.request', payload: { contentId: skillet.id, requestedBy: 'Mara Bell', reviewer: 'Amina Reed' } });
  await run({ commandId: cid('approval_skillet_approve'), tenantId, type: 'approval.decide', payload: { approvalId: skilletApproval.id, decision: 'approved', actor: 'Amina Reed', note: 'The quiet pacing and credits are exactly right.' } });
  const skilletPublication = await run({ commandId: cid('publication_skillet'), tenantId, type: 'publication.schedule', payload: { contentId: skillet.id, channel: 'Instagram Reels', scheduledAt: '2026-09-20T16:30:00.000Z', variant: { caption: 'Some recipes begin before we do.' } } });
  await run({ commandId: cid('receipt_skillet'), tenantId, type: 'publication.record_receipt', payload: { publicationId: skilletPublication.id, receipt: { externalId: 'fictional-reel-EO-204', url: 'https://example.test/ember/skillet', publishedAt: '2026-09-20T16:31:00.000Z' } } });
  const obsOne = await run({ commandId: cid('metrics_skillet_1'), tenantId, type: 'analytics.ingest_metrics', payload: { publicationId: skilletPublication.id, windowStart: '2026-09-20T16:31:00.000Z', windowEnd: '2026-09-23T16:31:00.000Z', metrics: [{ name: 'views', value: 48_620, unit: 'count' }, { name: 'completion_rate', value: 0.64, unit: 'ratio' }] } });
  const obsTwo = await run({ commandId: cid('metrics_skillet_2'), tenantId, type: 'analytics.ingest_metrics', payload: { publicationId: skilletPublication.id, windowStart: '2026-09-23T16:31:00.000Z', windowEnd: '2026-09-27T12:00:00.000Z', metrics: [{ name: 'views', value: 31_840, unit: 'count' }, { name: 'completion_rate', value: 0.59, unit: 'ratio' }] } });
  await run({ commandId: cid('insight_skillet'), tenantId, type: 'learning.generate_insight', payload: { observationIds: [obsOne.id, obsTwo.id] } });

  const pears = await run({ commandId: cid('content_pears'), tenantId, type: 'content.create_brief', payload: { campaignId: tableCampaign.id, title: 'Pears After First Frost', idea: 'A field note on why the cold changes the fruit.', hooks: ['Wait for the first frost.', 'The sweetest harvest starts with patience.'], brief: 'Macro field photography with a concise grower voiceover and practical buying cue.', cta: 'Take this note to the market.', metadata: { format: 'field note', duration: '00:32', owner: 'Mara Bell' } } });
  await advance('pears', pears.id, ['script', 'production', 'edit', 'qa', 'review']);
  await run({ commandId: cid('approval_pears'), tenantId, type: 'approval.request', payload: { contentId: pears.id, requestedBy: 'Mara Bell', reviewer: 'Amina Reed' } });

  const preserving = await run({ commandId: cid('content_preserving'), tenantId, type: 'content.create_brief', payload: { campaignId: tableCampaign.id, title: 'A Small Guide to Preserving', idea: 'Three fundamentals make preserving feel approachable.', hooks: ['You only need three rules.', 'Start with clean jars and good fruit.'], brief: 'Clear overhead tutorial with gentle supers and a printable companion.', cta: 'Keep the guide for harvest weekend.', metadata: { format: 'tutorial', duration: '01:10', owner: 'Jonah Vale' } } });
  await advance('preserving', preserving.id, ['script', 'production']);

  const soundcheck = await run({ commandId: cid('content_soundcheck'), tenantId, type: 'content.create_brief', payload: { campaignId: roomsCampaign.id, title: 'Five Minutes Before Soundcheck', idea: 'The suspended quiet just before a room becomes music.', hooks: ['The room is loudest before anyone plays.', 'Five minutes until the first note.'], brief: 'A patient observational cut through cables, breath, empty chairs, and the engineer’s final nod.', cta: 'Meet us before the doors open.', metadata: { format: 'vertical cut', duration: '00:42', owner: 'Ellis North' } } });
  await advance('soundcheck', soundcheck.id, ['script', 'production', 'edit', 'qa', 'review']);
  const soundApproval = await run({ commandId: cid('approval_soundcheck'), tenantId, type: 'approval.request', payload: { contentId: soundcheck.id, requestedBy: 'Ellis North', reviewer: 'Imani Brooks' } });
  await run({ commandId: cid('approval_soundcheck_approve'), tenantId, type: 'approval.decide', payload: { approvalId: soundApproval.id, decision: 'approved', actor: 'Imani Brooks' } });
  await run({ commandId: cid('publication_soundcheck'), tenantId, type: 'publication.schedule', payload: { contentId: soundcheck.id, channel: 'TikTok', scheduledAt: '2026-09-29T22:00:00.000Z', variant: { caption: 'Before the doors, the room takes a breath.' } } });

  const artistLetter = await run({ commandId: cid('content_artist_letter'), tenantId, type: 'content.create_brief', payload: { campaignId: roomsCampaign.id, title: 'Letter from Room Three', idea: 'An artist reflects on the room that changed the set.', hooks: ['Room Three changed the last song.', 'A note left after everyone went home.'], brief: 'A simple letter-led carousel with documentary stills and approved excerpts.', cta: 'Read the full session note.', metadata: { format: 'carousel', slides: '8', owner: 'Ellis North' } } });
  await advance('artist_letter', artistLetter.id, ['script', 'production', 'edit', 'qa', 'review']);
  const letterApproval = await run({ commandId: cid('approval_artist_letter'), tenantId, type: 'approval.request', payload: { contentId: artistLetter.id, requestedBy: 'Ellis North', reviewer: 'Imani Brooks' } });
  await run({ commandId: cid('approval_artist_letter_revision'), tenantId, type: 'approval.decide', payload: { approvalId: letterApproval.id, decision: 'revision_requested', actor: 'Imani Brooks', note: 'Use the artist-approved second paragraph and remove the unreleased song title.' } });

  const roomTone = await run({ commandId: cid('content_room_tone'), tenantId, type: 'content.create_brief', payload: { campaignId: roomsCampaign.id, title: 'Room Tone No. 01', idea: 'Thirty seconds of a beloved room between performances.', hooks: ['Listen to what remains.', 'Every room has a note of its own.'], brief: 'A minimal sound-first interlude. No music, just an authored portrait of space.', cta: 'Put on headphones.', metadata: { format: 'sound portrait', duration: '00:30', owner: 'Nia Grey' } } });
  await advance('room_tone', roomTone.id, ['script', 'production', 'edit', 'qa']);

  await run({ commandId: cid('engagement_ember'), tenantId, type: 'commerce.create_engagement', payload: { campaignIds: [tableCampaign.id], kind: 'project', package: { code: 'editorial-season', name: 'Seasonal Editorial System', price: money(12_500_000, 'USD'), deliverables: ['editorial strategy', '11 productions', 'performance report'] }, contractedRevenue: money(12_500_000, 'USD'), costs: [{ category: 'production', description: 'Field production and post', amount: money(3_250_000, 'USD') }, { category: 'other', description: 'Travel and materials', amount: money(650_000, 'USD') }], creatorPayouts: [{ creatorId: 'fictional-producer-mara', amount: money(1_800_000, 'USD'), status: 'planned' }], startsAt: '2026-09-01T00:00:00.000Z', endsAt: '2026-11-30T23:59:59.000Z' } });
  await run({ commandId: cid('engagement_northstar'), tenantId, type: 'commerce.create_engagement', payload: { campaignIds: [roomsCampaign.id], kind: 'retainer', package: { code: 'listening-room-retainer', name: 'Listening Room Editorial Retainer', price: money(18_000_000, 'USD'), deliverables: ['monthly production', 'channel programming', 'learning review'] }, contractedRevenue: money(18_000_000, 'USD'), costs: [{ category: 'production', description: 'Session capture and post', amount: money(4_800_000, 'USD') }, { category: 'platform', description: 'Captioning and delivery', amount: money(420_000, 'USD') }], creatorPayouts: [{ creatorId: 'fictional-director-ellis', amount: money(2_400_000, 'USD'), status: 'planned' }], startsAt: '2026-09-15T00:00:00.000Z', endsAt: '2026-12-15T23:59:59.000Z' } });

  console.log(`Seed complete for ${tenantId}: 2 brands, 2 campaigns, 6 content items, approvals, distribution, analytics, insight, and commerce.`);
} finally {
  await pool.end();
}
