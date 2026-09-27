import Link from 'next/link';
import { Empty, Notice, PageHeader, Status } from '../../components/chrome';
import { dateTime } from '../../lib/format';
import { decideApproval } from '../../server/actions';
import { queries, tenantId } from '../../server/runtime';

export const dynamic = 'force-dynamic';
export default async function Approvals({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const [pending, history, message] = await Promise.all([queries().approvals(tenantId()), queries().approvals(tenantId(), false), searchParams]);
  return <><PageHeader eyebrow="Review desk" title="Decisions with a paper trail." description="Approve work that is ready, or send it back with specific revision direction. Every decision is audited." />
    <Notice error={message.error} success={message.success} />
    {pending.length === 0 ? <Empty title="Approval queue cleared">Nothing is waiting for a decision.</Empty> : <div className="card-grid">{pending.map(({ approval, content, campaignName, brandName }) => <article className="card" key={approval.id}><div className="panel-head"><span className="eyebrow">{brandName}</span><Status value={approval.status} /></div><h3><Link href={`/content/${content.id}`}>{content.title}</Link></h3><p>{campaignName}<br />Requested by {approval.requestedBy} for {approval.reviewer}</p><div className="actions"><form action={decideApproval}><input type="hidden" name="approvalId" value={approval.id} /><input type="hidden" name="decision" value="approved" /><input type="hidden" name="actor" value="Storyhouse operator" /><button className="button primary">Approve</button></form></div><form action={decideApproval}><input type="hidden" name="approvalId" value={approval.id} /><input type="hidden" name="decision" value="revision_requested" /><input type="hidden" name="actor" value="Storyhouse operator" /><label>Revision note<textarea name="note" required placeholder="Be specific about what needs to change." /></label><button className="button subtle">Request revision</button></form></article>)}</div>}
    <section style={{ marginTop: 42 }}><h2>Audit history</h2><div className="table-wrap"><table><thead><tr><th>Content</th><th>Status</th><th>Reviewer</th><th>Latest action</th><th>Requested</th></tr></thead><tbody>{history.map(({ approval, content }) => { const latest = approval.history.at(-1); return <tr key={approval.id}><td><Link href={`/content/${content.id}`}><strong>{content.title}</strong></Link></td><td><Status value={approval.status} /></td><td>{approval.reviewer}</td><td>{latest?.actor}<small>{latest?.note}</small></td><td>{dateTime(approval.createdAt)}</td></tr>; })}</tbody></table></div></section>
  </>;
}
