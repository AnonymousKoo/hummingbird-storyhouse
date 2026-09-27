import Link from 'next/link';
import { productionPath } from 'hummingbird-storyhouse-core';
import { Empty, PageHeader } from '../components/chrome';
import { dateTime, label, money, percent } from '../lib/format';
import { queries, tenantId } from '../server/runtime';

export const dynamic = 'force-dynamic';

export default async function CommandCenter() {
  const dashboard = await queries().dashboard(tenantId());
  const max = Math.max(...Object.values(dashboard.pipeline), 1);
  return <>
    <PageHeader eyebrow="Command center" title="The whole story, in motion." description="A live editorial view of brands, campaigns, production, distribution, learning, and the economics underneath it all." />
    <section className="metric-grid" aria-label="Operating summary">
      {[
        ['Brands', dashboard.counts.brands, 'in the house'], ['Active campaigns', dashboard.counts.activeCampaigns, 'currently running'],
        ['In production', dashboard.counts.contentInProduction, 'pieces moving'], ['Pending approval', dashboard.counts.pendingApprovals, 'awaiting decision'],
        ['Scheduled', dashboard.counts.scheduledPublications, 'ready to publish']
      ].map(([name, number, note]) => <div className="metric" key={name}><small>{name}</small><strong>{number}</strong><em>{note}</em></div>)}
    </section>
    <div className="section-grid">
      <section className="panel"><div className="panel-head"><h2>Editorial pipeline</h2><Link href="/content">Open production board →</Link></div><div className="pipeline">
        {productionPath.slice(1).map((state) => <div key={state}><i style={{ height: `${Math.max(4, dashboard.pipeline[state] / max * 120)}px` }} /><strong>{dashboard.pipeline[state]}</strong><small>{label(state)}</small></div>)}
      </div></section>
      <section className="panel"><div className="panel-head"><h2>Needs attention</h2><span className="status status-pending">{dashboard.attention.length} items</span></div>
        {dashboard.attention.length === 0 ? <Empty title="The desk is clear">No deterministic alerts need attention right now.</Empty> : <ul className="attention">{dashboard.attention.slice(0, 5).map((item) => <li key={`${item.kind}-${item.href}-${item.title}`}><i /><Link href={item.href}><strong>{item.title}</strong><span>{item.detail}</span></Link><span>→</span></li>)}</ul>}
      </section>
    </div>
    <div className="section-grid">
      <section className="panel"><div className="panel-head"><h2>Recent activity</h2><span className="eyebrow">Committed events</span></div>
        {dashboard.recentActivity.length === 0 ? <Empty title="No activity yet">Seed the local tenant or start with a brand to bring this timeline to life.</Empty> : <ul className="activity">{dashboard.recentActivity.map((event) => <li key={event.id}><i /><div><strong>{label(event.type.replace('.', ' · '))}</strong><span>{event.aggregateId}</span></div><time>{dateTime(event.occurredAt)}</time></li>)}</ul>}
      </section>
      <div style={{ display: 'grid', gap: 24 }}>
        <section className="panel"><div className="panel-head"><h2>Performance</h2><Link href="/analytics">Explore analytics →</Link></div><div className="economics"><div><small>Views</small><strong>{Math.round(dashboard.performance['views'] ?? 0).toLocaleString()}</strong></div><div><small>Completion</small><strong>{percent(dashboard.performance['completion_rate'] ?? 0)}</strong></div><div><small>Observations</small><strong>{Object.keys(dashboard.performance).length}</strong></div></div></section>
        <section className="panel"><div className="panel-head"><h2>Economics</h2><Link href="/commerce">View commerce →</Link></div><div className="economics"><div><small>Contracted</small><strong>{money(dashboard.economics.revenue)}</strong></div><div><small>Modeled cost</small><strong>{money(dashboard.economics.costs)}</strong></div><div><small>Margin</small><strong>{money(dashboard.economics.contributionMargin)}</strong></div></div></section>
      </div>
    </div>
    <section><div className="panel-head"><h2>Fast actions</h2></div><div className="card-grid">
      <Link className="card" href="/brands#new"><span className="eyebrow">01 · Foundation</span><h3>Onboard a brand</h3><p>Capture purpose, audience, voice, objectives, constraints, and platform context.</p><span className="card-meta">Begin intake →</span></Link>
      <Link className="card" href="/campaigns#new"><span className="eyebrow">02 · Planning</span><h3>Create a campaign</h3><p>Turn an active strategy into dates, goals, channels, deliverables, and budget.</p><span className="card-meta">Plan work →</span></Link>
      <Link className="card" href="/content#new"><span className="eyebrow">03 · Editorial</span><h3>Write a content brief</h3><p>Give the production team a sharp idea, hooks, direction, CTA, and format.</p><span className="card-meta">Shape the story →</span></Link>
    </div></section>
  </>;
}
