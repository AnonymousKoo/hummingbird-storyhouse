import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NotFoundError } from 'hummingbird-storyhouse-core';
import { Notice, PageHeader, Status } from '../../../components/chrome';
import { dateTime } from '../../../lib/format';
import { decideApproval } from '../../../server/actions';
import { queries, tenantId } from '../../../server/runtime';

export const dynamic = 'force-dynamic';

export default async function ApprovalDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; success?: string }> }) {
  const [{ id }, message] = await Promise.all([params, searchParams]);
  let item;
  try { item = await queries().approval(tenantId(), id); } catch (error) { if (error instanceof NotFoundError) notFound(); throw error; }
  const { approval, content, brandName, campaignName } = item;
  return <><PageHeader eyebrow={`${brandName} · ${campaignName}`} title={content.title} description={`Review requested by ${approval.requestedBy} for ${approval.reviewer}.`} /><Notice error={message.error} success={message.success} />
    <div className="detail-grid"><section className="panel"><div className="panel-head"><h2>Approval record</h2><Status value={approval.status} /></div><p>{content.brief}</p><Link className="button subtle" href={`/content/${content.id}`}>Open content detail</Link><h2 style={{ marginTop: 28 }}>Audit trail</h2><div className="audit">{approval.history.map((entry, index) => <article key={`${entry.at}-${index}`}><Status value={entry.action} /><p><strong>{entry.actor}</strong>{entry.note ? ` · ${entry.note}` : ''}</p><small>{dateTime(entry.at)}</small></article>)}</div></section>
      {approval.status === 'pending' && <aside className="form-panel"><h2>Make a decision</h2><form action={decideApproval}><input type="hidden" name="approvalId" value={approval.id} /><input type="hidden" name="decision" value="approved" /><input type="hidden" name="actor" value="Storyhouse operator" /><button className="button primary">Approve content</button></form><form action={decideApproval} style={{ marginTop: 20 }}><input type="hidden" name="approvalId" value={approval.id} /><input type="hidden" name="decision" value="revision_requested" /><input type="hidden" name="actor" value="Storyhouse operator" /><label>Required revision note<textarea name="note" required placeholder="Describe exactly what must change." /></label><button className="button subtle">Request revision</button></form></aside>}
    </div>
  </>;
}
