import { InvalidTransitionError, invariant, nonEmpty, type ApprovalId, type ContentId, type TenantId } from './shared.js';
import type { Repository } from '../ports/index.js';

export type ApprovalStatus = 'pending' | 'approved' | 'revision_requested';
export interface ApprovalAuditEntry { readonly at: string; readonly actor: string; readonly action: 'requested' | 'approved' | 'revision_requested'; readonly note?: string }
export interface ApprovalRequest {
  readonly id: ApprovalId; readonly tenantId: TenantId; readonly contentId: ContentId;
  readonly status: ApprovalStatus; readonly requestedBy: string; readonly reviewer: string;
  readonly history: readonly ApprovalAuditEntry[]; readonly createdAt: string;
}
export function createApproval(input: ApprovalRequest): ApprovalRequest {
  nonEmpty(input.requestedBy, 'Requester'); nonEmpty(input.reviewer, 'Reviewer');
  invariant(input.status === 'pending', 'A review request starts pending');
  return structuredClone(input);
}
export function decideApproval(request: ApprovalRequest, decision: 'approved' | 'revision_requested', actor: string, at: string, note?: string): ApprovalRequest {
  if (request.status !== 'pending') throw new InvalidTransitionError(request.status, decision);
  if (decision === 'revision_requested') invariant(Boolean(note?.trim()), 'A revision request needs a note');
  const entry: ApprovalAuditEntry = { at, actor: nonEmpty(actor, 'Actor'), action: decision, ...(note === undefined ? {} : { note }) };
  return { ...request, status: decision, history: [...request.history, entry] };
}
export type ApprovalRepository = Repository<ApprovalRequest>;
