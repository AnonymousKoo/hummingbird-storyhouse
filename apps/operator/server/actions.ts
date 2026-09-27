'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  DomainError,
  money,
  type ApprovalId,
  type BrandId,
  type CampaignId,
  type ContentId,
  type ObservationId,
  type ProductionState,
  type PublicationId,
  type StrategyId
} from 'hummingbird-storyhouse-core';
import { commandId, execute, tenantId } from './runtime';

const value = (form: FormData, key: string): string => {
  const field = form.get(key);
  return typeof field === 'string' ? field.trim() : '';
};
const lines = (form: FormData, key: string): string[] => value(form, key).split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
const optional = (form: FormData, key: string): string | undefined => value(form, key) || undefined;

function dollars(raw: string): number {
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) throw new Error('Money must be a positive dollar amount with at most two decimals.');
  const [whole = '0', fraction = ''] = raw.split('.');
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(result)) throw new Error('Money amount is too large.');
  return result;
}

const localIso = (raw: string): string => {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) throw new Error('A valid date and time is required.');
  return date.toISOString();
};

function safeMessage(error: unknown): string {
  if (error instanceof DomainError) return error.message;
  if (error instanceof Error && ['Money must', 'Money amount', 'A valid date'].some((prefix) => error.message.startsWith(prefix))) return error.message;
  return 'The operation could not be completed. Check the form and try again.';
}

async function perform(returnTo: string, paths: readonly string[], operation: () => Promise<unknown>): Promise<never> {
  try {
    await operation();
  } catch (error: unknown) {
    redirect(`${returnTo}?error=${encodeURIComponent(safeMessage(error))}`);
  }
  for (const path of paths) revalidatePath(path);
  redirect(`${returnTo}?success=1`);
}

export async function onboardBrand(form: FormData): Promise<never> {
  return perform('/brands', ['/', '/brands'], () => execute({
    commandId: commandId(), tenantId: tenantId(), type: 'brand.onboard',
    payload: {
      organizationName: value(form, 'organizationName'), name: value(form, 'name'),
      profile: { purpose: value(form, 'purpose'), audiences: lines(form, 'audiences'), voice: lines(form, 'voice'), objectives: lines(form, 'objectives'), constraints: lines(form, 'constraints'), platforms: lines(form, 'platforms') }
    }
  }));
}

export async function createCampaign(form: FormData): Promise<never> {
  const [strategyId = '', brandId = ''] = value(form, 'strategySelection').split('|');
  return perform('/campaigns', ['/', '/campaigns'], () => execute({
    commandId: commandId(), tenantId: tenantId(), type: 'campaign.create',
    payload: {
      brandId: brandId as BrandId, strategyId: strategyId as StrategyId,
      name: value(form, 'name'), goals: lines(form, 'goals'), startAt: localIso(value(form, 'startAt')), endAt: localIso(value(form, 'endAt')),
      budget: money(dollars(value(form, 'budget')), 'USD'), channels: lines(form, 'channels'), deliverables: lines(form, 'deliverables'), assigneeIds: []
    }
  }));
}

export async function createContentBrief(form: FormData): Promise<never> {
  return perform('/content', ['/', '/content'], () => execute({
    commandId: commandId(), tenantId: tenantId(), type: 'content.create_brief',
    payload: { campaignId: value(form, 'campaignId') as CampaignId, title: value(form, 'title'), idea: value(form, 'idea'), hooks: lines(form, 'hooks'), brief: value(form, 'brief'), cta: value(form, 'cta'), metadata: { format: value(form, 'format') || 'vertical' } }
  }));
}

export async function advanceContent(form: FormData): Promise<never> {
  const contentId = value(form, 'contentId') as ContentId;
  return perform(`/content/${contentId}`, ['/', '/content', `/content/${contentId}`], () => execute({ commandId: commandId(), tenantId: tenantId(), type: 'content.advance', payload: { contentId, to: value(form, 'to') as ProductionState } }));
}

export async function requestApproval(form: FormData): Promise<never> {
  const contentId = value(form, 'contentId') as ContentId;
  return perform(`/content/${contentId}`, ['/', '/content', '/approvals', `/content/${contentId}`], () => execute({ commandId: commandId(), tenantId: tenantId(), type: 'approval.request', payload: { contentId, requestedBy: value(form, 'requestedBy'), reviewer: value(form, 'reviewer') } }));
}

export async function decideApproval(form: FormData): Promise<never> {
  const approvalId = value(form, 'approvalId') as ApprovalId;
  return perform('/approvals', ['/', '/content', '/approvals', '/distribution'], () => execute({ commandId: commandId(), tenantId: tenantId(), type: 'approval.decide', payload: { approvalId, decision: value(form, 'decision') as 'approved' | 'revision_requested', actor: value(form, 'actor'), ...(optional(form, 'note') === undefined ? {} : { note: optional(form, 'note') }) } }));
}

export async function schedulePublication(form: FormData): Promise<never> {
  return perform('/distribution', ['/', '/content', '/distribution'], () => execute({ commandId: commandId(), tenantId: tenantId(), type: 'publication.schedule', payload: { contentId: value(form, 'contentId') as ContentId, channel: value(form, 'channel'), scheduledAt: localIso(value(form, 'scheduledAt')), variant: { caption: value(form, 'caption') } } }));
}

export async function recordReceipt(form: FormData): Promise<never> {
  return perform('/distribution', ['/', '/content', '/distribution', '/analytics'], () => execute({ commandId: commandId(), tenantId: tenantId(), type: 'publication.record_receipt', payload: { publicationId: value(form, 'publicationId') as PublicationId, receipt: { externalId: value(form, 'externalId'), ...(optional(form, 'url') === undefined ? {} : { url: optional(form, 'url') }), publishedAt: localIso(value(form, 'publishedAt')) } } }));
}

export async function ingestMetrics(form: FormData): Promise<never> {
  const end = localIso(value(form, 'windowEnd'));
  return perform('/analytics', ['/', '/analytics', '/insights'], () => execute({ commandId: commandId(), tenantId: tenantId(), type: 'analytics.ingest_metrics', payload: { publicationId: value(form, 'publicationId') as PublicationId, windowStart: localIso(value(form, 'windowStart')), windowEnd: end, metrics: [{ name: 'views', value: Number(value(form, 'views')), unit: 'count' }, { name: 'completion_rate', value: Number(value(form, 'completionRate')) / 100, unit: 'ratio' }] } }));
}

export async function generateInsight(form: FormData): Promise<never> {
  return perform('/insights', ['/', '/insights'], () => execute({ commandId: commandId(), tenantId: tenantId(), type: 'learning.generate_insight', payload: { observationIds: form.getAll('observationIds').map(String) as ObservationId[] } }));
}

export async function createEngagement(form: FormData): Promise<never> {
  const revenue = dollars(value(form, 'revenue'));
  const cost = dollars(value(form, 'cost'));
  const payout = dollars(value(form, 'payout'));
  return perform('/commerce', ['/', '/campaigns', '/commerce'], () => execute({
    commandId: commandId(), tenantId: tenantId(), type: 'commerce.create_engagement',
    payload: {
      campaignIds: form.getAll('campaignIds').map(String) as CampaignId[], kind: value(form, 'kind') as 'retainer' | 'project',
      package: { code: value(form, 'packageCode'), name: value(form, 'packageName'), price: money(revenue, 'USD'), deliverables: lines(form, 'deliverables') },
      contractedRevenue: money(revenue, 'USD'), costs: cost === 0 ? [] : [{ category: 'production', description: 'Production costs', amount: money(cost, 'USD') }],
      creatorPayouts: payout === 0 ? [] : [{ creatorId: 'internal-creator-pool', amount: money(payout, 'USD'), status: 'planned' }], startsAt: localIso(value(form, 'startsAt')), ...(optional(form, 'endsAt') === undefined ? {} : { endsAt: localIso(value(form, 'endsAt')) })
    }
  }));
}
