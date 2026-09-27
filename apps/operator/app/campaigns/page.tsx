import Link from 'next/link';
import { Empty, Notice, PageHeader, Status } from '../../components/chrome';
import { date, money } from '../../lib/format';
import { createCampaign } from '../../server/actions';
import { queries, tenantId } from '../../server/runtime';

export const dynamic = 'force-dynamic';
export default async function Campaigns({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const service = queries();
  const [items, brands, message] = await Promise.all([service.campaigns(tenantId()), service.brands(tenantId()), searchParams]);
  const details = await Promise.all(brands.map((item) => service.brand(tenantId(), item.brand.id)));
  const activeStrategies = details.flatMap((item) => item.strategies.filter((strategy) => strategy.status === 'active').map((strategy) => ({ strategy, brand: item.brand })));
  return <><PageHeader eyebrow="Campaign portfolio" title="Strategy, put to work." description="Active programs with clear outcomes, accountable dates, planned channels, deliverables, and budgets." />
    <Notice error={message.error} success={message.success} />
    <div className="split"><section>{items.length === 0 ? <Empty title="No campaigns yet">An active strategy is required before campaign work can begin.</Empty> : <div className="card-grid">{items.map(({ campaign, brandName, strategyVersion, contentCounts }) => <Link className="card" href={`/campaigns/${campaign.id}`} key={campaign.id}><div className="panel-head"><span className="eyebrow">{brandName} · Strategy v{strategyVersion}</span><Status value={campaign.status} /></div><h3>{campaign.name}</h3><p>{campaign.goals.join(' · ')}</p><div className="card-meta"><span>{date(campaign.startAt)}—{date(campaign.endAt)}</span><span>{money(campaign.budget)}</span><span>{Object.values(contentCounts).reduce((sum, count) => sum + count, 0)} pieces</span></div></Link>)}</div>}</section>
      <aside className="form-panel" id="new"><h2>Create campaign</h2>{activeStrategies.length === 0 ? <div className="notice error">No active strategy exists. Create and activate a strategy through the core workflow before planning a campaign.</div> : <form action={createCampaign}><label>Brand · active strategy<select name="strategySelection" required>{activeStrategies.map(({ strategy, brand }) => <option value={`${strategy.id}|${brand.id}`} key={strategy.id}>{brand.name} · v{strategy.version}</option>)}</select></label><label>Campaign name<input name="name" required placeholder="Autumn Table Stories" /></label><label>Goals<textarea name="goals" required placeholder="Build consideration, earn saves" /></label><div className="form-row"><label>Start<input name="startAt" type="datetime-local" required /></label><label>End<input name="endAt" type="datetime-local" required /></label></div><label>Budget (USD)<input name="budget" inputMode="decimal" required placeholder="25000.00" /></label><div className="form-row"><label>Channels<textarea name="channels" required placeholder="Instagram, YouTube" /></label><label>Deliverables<textarea name="deliverables" required placeholder="6 short films, 2 carousels" /></label></div><p className="help">The selected active strategy carries its brand relationship into the command.</p><button className="button primary">Create campaign</button></form>}</aside>
    </div></>;
}
