import { notFound } from 'next/navigation';
import { NotFoundError } from 'hummingbird-storyhouse-core';
import { PageHeader, Status } from '../../../components/chrome';
import { date, money } from '../../../lib/format';
import { queries, tenantId } from '../../../server/runtime';

export const dynamic = 'force-dynamic';
export default async function BrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let item;
  try { item = await queries().brand(tenantId(), id); } catch (error) { if (error instanceof NotFoundError) notFound(); throw error; }
  const { brand, strategies, campaigns } = item;
  return <><PageHeader eyebrow={brand.organizationName} title={brand.name} description={brand.profile.purpose} />
    <div className="detail-grid"><section className="panel"><h2>Brand brain</h2><dl className="definition"><dt>Audiences</dt><dd>{brand.profile.audiences.join(' · ')}</dd><dt>Objectives</dt><dd>{brand.profile.objectives.join(' · ')}</dd><dt>Voice</dt><dd>{brand.profile.voice.join(' · ')}</dd><dt>Platforms</dt><dd>{brand.profile.platforms.join(' · ')}</dd><dt>Constraints</dt><dd>{brand.profile.constraints.join(' · ') || 'None recorded'}</dd><dt>Onboarded</dt><dd>{date(brand.createdAt)}</dd></dl></section>
      <section className="panel"><h2>Operating footprint</h2><div className="economics"><div><small>Strategies</small><strong>{strategies.length}</strong></div><div><small>Campaigns</small><strong>{campaigns.length}</strong></div><div><small>Content</small><strong>{item.contentCount}</strong></div></div></section></div>
    <section style={{ marginTop: 30 }}><h2>Strategies</h2><div className="table-wrap"><table><thead><tr><th>Version</th><th>Status</th><th>Goals</th><th>Pillars</th><th>Channels</th></tr></thead><tbody>{strategies.map((strategy) => <tr key={strategy.id}><td><strong>v{strategy.version}</strong></td><td><Status value={strategy.status} /></td><td>{strategy.goals.join(', ')}</td><td>{strategy.pillars.join(', ')}</td><td>{strategy.channels.map((channel) => channel.channel).join(', ')}</td></tr>)}</tbody></table></div></section>
    <section style={{ marginTop: 35 }}><h2>Campaigns</h2><div className="card-grid">{campaigns.map((campaign) => <a className="card" href={`/campaigns/${campaign.id}`} key={campaign.id}><Status value={campaign.status} /><h3>{campaign.name}</h3><p>{campaign.goals.join(' · ')}</p><div className="card-meta"><span>{date(campaign.startAt)}—{date(campaign.endAt)}</span><span>{money(campaign.budget)}</span></div></a>)}</div></section>
  </>;
}
