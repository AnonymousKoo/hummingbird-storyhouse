import { describe, expect, it } from 'vitest';
import { OperatorQueryService, NotFoundError, type ActivityRepository, type OutboxRecord } from '../src/index.js';
import { campaignFixture, commandId, tenantA, tenantB } from './helpers.js';

describe('operator read models', () => {
  it('assembles dashboard and content detail without leaking joins to consumers', async () => {
    const setup = await campaignFixture();
    const content = await setup.service.createContentBrief(commandId(), {
      tenantId: tenantA, campaignId: setup.campaign.id, title: 'A fictional maker note', idea: 'Show one clear technique.',
      hooks: ['Begin with the detail.'], brief: 'A concise editorial brief.', cta: 'Save the note.'
    });
    await setup.service.advanceContent(commandId(), tenantA, content.id, 'script');
    const activity: ActivityRepository = {
      listRecent(tenantId, limit = 20): Promise<readonly OutboxRecord[]> {
        return Promise.resolve(setup.events.events.filter((event) => event.tenantId === tenantId).slice(-limit).reverse().map((event) => ({ ...event, attempts: 0 })));
      }
    };
    const queries = new OperatorQueryService(setup.repositories, activity, { now: () => new Date('2026-02-01T00:00:00.000Z') });

    const dashboard = await queries.dashboard(tenantA);
    expect(dashboard.counts).toMatchObject({ brands: 1, activeCampaigns: 1, contentInProduction: 1 });
    expect(dashboard.pipeline.script).toBe(1);
    expect(dashboard.recentActivity[0]?.type).toBe('content.advanced');

    const detail = await queries.contentDetail(tenantA, content.id);
    expect(detail).toMatchObject({ campaignName: 'Maker Month', brandName: 'Cedar & Finch', nextState: 'production' });
  });

  it('keeps every operator query inside its explicit tenant boundary', async () => {
    const setup = await campaignFixture();
    const activity: ActivityRepository = { listRecent: () => Promise.resolve([]) };
    const queries = new OperatorQueryService(setup.repositories, activity, { now: () => new Date() });

    expect(await queries.brands(tenantB)).toEqual([]);
    expect(await queries.campaigns(tenantB)).toEqual([]);
    expect(await queries.content(tenantB)).toEqual([]);
    expect((await queries.dashboard(tenantB)).counts.brands).toBe(0);
    await expect(queries.brand(tenantB, setup.brand.id)).rejects.toBeInstanceOf(NotFoundError);
    await expect(queries.campaign(tenantB, setup.campaign.id)).rejects.toBeInstanceOf(NotFoundError);
  });
});
