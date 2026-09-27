import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NotFoundError } from 'hummingbird-storyhouse-core';
import { PageHeader, Status } from '../../../components/chrome';
import { date, label, money, percent } from '../../../lib/format';
import { queries, tenantId } from '../../../server/runtime';

export const dynamic = 'force-dynamic';
export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; let item;
  try { item = await queries().campaign(tenantId(), id); } catch (error) { if (error instanceof NotFoundError) notFound(); throw error; }
  const { campaign, brand, strategy, content, engagements } = item;
  return <><PageHeader eyebrow={`${brand.name} · Strategy v${strategy.version}`} title={campaign.name} description={campaign.goals.join(' · ')} />
    <section className="detail-hero"><Status value={campaign.status} /><h1>{money(campaign.budget)} campaign</h1><p>{date(campaign.startAt)} through {date(campaign.endAt)} · {campaign.channels.join(' · ')}</p><div className="tag-list">{campaign.deliverables.map((item) => <span className="tag" key={item}>{item}</span>)}</div></section>
    <div className="detail-grid"><section className="panel"><h2>Content pipeline</h2>{content.length === 0 ? <p>No content briefs have been attached yet.</p> : <div className="table-wrap"><table><thead><tr><th>Story</th><th>Stage</th><th>Updated</th></tr></thead><tbody>{content.map((content) => <tr key={content.id}><td><Link href={`/content/${content.id}`}><strong>{content.title}</strong><small>{content.idea}</small></Link></td><td><Status value={content.state} /></td><td>{date(content.updatedAt)}</td></tr>)}</tbody></table></div>}</section>
      <aside className="panel"><h2>Strategy context</h2><dl className="definition"><dt>Goals</dt><dd>{strategy.goals.join(' · ')}</dd><dt>Pillars</dt><dd>{strategy.pillars.join(' · ')}</dd><dt>Channels</dt><dd>{strategy.channels.map((channel) => `${channel.channel}: ${channel.role}`).join(' · ')}</dd><dt>KPIs</dt><dd>{strategy.kpis.map((kpi) => `${label(kpi.metric)} ${kpi.target}`).join(' · ')}</dd></dl></aside></div>
    <section style={{ marginTop: 30 }} className="panel"><h2>Engagement economics</h2>{engagements.length === 0 ? <p>No engagement is attached to this campaign.</p> : engagements.map(({ engagement, economics }) => <div className="economics" key={engagement.id}><div><small>{engagement.package.name}</small><strong>{money(economics.revenue)}</strong></div><div><small>Cost</small><strong>{money(economics.costs)}</strong></div><div><small>Contribution · {percent(economics.marginRatio)}</small><strong>{money(economics.contributionMargin)}</strong></div></div>)}</section>
  </>;
}
