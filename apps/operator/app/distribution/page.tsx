import Link from 'next/link';
import { Empty, Notice, PageHeader, Status } from '../../components/chrome';
import { dateTime } from '../../lib/format';
import { recordReceipt, schedulePublication } from '../../server/actions';
import { queries, tenantId } from '../../server/runtime';

export const dynamic = 'force-dynamic';
export default async function Distribution({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const [items, message] = await Promise.all([queries().distribution(tenantId()), searchParams]);
  const approved = items.filter((item) => item.content.state === 'approved');
  const scheduled = items.filter((item) => item.publication?.status === 'scheduled');
  return <><PageHeader eyebrow="Distribution desk" title="Ready for the world." description="Plan approved stories by channel, then record platform-neutral receipts after manual publication testing." />
    <Notice error={message.error} success={message.success} />
    <div className="split"><section><h2>Scheduled & published</h2>{items.filter((item) => item.publication).length === 0 ? <Empty title="Nothing on the calendar">Approved work can be scheduled from this desk.</Empty> : <div className="table-wrap"><table><thead><tr><th>Story</th><th>Channel</th><th>Status</th><th>Timing</th><th>Receipt</th></tr></thead><tbody>{items.filter((item) => item.publication).map((item) => <tr key={item.publication?.id}><td><Link href={`/content/${item.content.id}`}><strong>{item.content.title}</strong><small>{item.brandName} · {item.campaignName}</small></Link></td><td>{item.publication?.channel}</td><td><Status value={item.publication?.status ?? item.content.state} /></td><td>{dateTime(item.publication?.scheduledAt ?? item.content.updatedAt)}</td><td>{item.publication?.receipt?.externalId ?? '—'}</td></tr>)}</tbody></table></div>}</section>
      <aside style={{ display: 'grid', gap: 22 }}><section className="form-panel"><h2>Schedule approved work</h2>{approved.length === 0 ? <p>No approved unscheduled content is available.</p> : <form action={schedulePublication}><label>Content<select name="contentId">{approved.map((item) => <option key={item.content.id} value={item.content.id}>{item.brandName} · {item.content.title}</option>)}</select></label><label>Channel<input name="channel" required placeholder="Instagram Reels" /></label><label>Date and time<input name="scheduledAt" type="datetime-local" required /></label><label>Caption / variant<textarea name="caption" placeholder="Optional channel-ready caption" /></label><button className="button primary">Schedule publication</button></form>}</section>
      <section className="form-panel"><h2>Record manual receipt</h2>{scheduled.length === 0 ? <p>No scheduled publication awaits a receipt.</p> : <form action={recordReceipt}><label>Publication<select name="publicationId">{scheduled.map((item) => <option key={item.publication?.id} value={item.publication?.id}>{item.content.title} · {item.publication?.channel}</option>)}</select></label><label>External ID<input name="externalId" required placeholder="fictional-post-1042" /></label><label>URL (optional)<input name="url" type="url" placeholder="https://example.test/post/1042" /></label><label>Published at<input name="publishedAt" type="datetime-local" required /></label><button className="button amber">Record receipt</button></form>}</section></aside></div>
  </>;
}
