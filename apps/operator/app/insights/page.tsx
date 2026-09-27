import { Empty, Notice, PageHeader, Status } from '../../components/chrome';
import { date, percent } from '../../lib/format';
import { generateInsight } from '../../server/actions';
import { queries, tenantId } from '../../server/runtime';

export const dynamic = 'force-dynamic';
export default async function Insights({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const service = queries(); const [items, analytics, message] = await Promise.all([service.insights(tenantId()), service.analytics(tenantId()), searchParams]);
  return <><PageHeader eyebrow="Learning loop" title="What the work is teaching us." description="Evidence-backed findings and recommendations. Generation is explicitly local and rule-based in this phase." />
    <Notice error={message.error} success={message.success} />
    <div className="notice">Internal generator · Deterministic rule-based analysis, not AI.</div>
    <div className="split"><section>{items.length === 0 ? <Empty title="No insights stored">Select observations from the same campaign to generate an evidence-backed proposal.</Empty> : <div style={{ display: 'grid', gap: 18 }}>{items.map(({ insight, campaignName, brandName, observations }) => <article className="panel" key={insight.id}><div className="panel-head"><span className="eyebrow">{brandName} · {campaignName}</span><Status value={insight.status} /></div><h2>{insight.finding}</h2><p><strong>Recommendation:</strong> {insight.recommendation}</p><h3>Source observations</h3><ul className="prose-list">{observations.map((observation) => <li key={observation.id}><strong>{date(observation.observedAt)}</strong> · {observation.metrics.map((metric) => `${metric.name.replaceAll('_', ' ')} ${metric.unit === 'ratio' ? percent(metric.value) : metric.value.toLocaleString()}`).join(' · ')}<small style={{ display: 'block' }}>{observation.id}</small></li>)}</ul><div className="card-meta"><span>{percent(insight.confidence)} confidence</span><span>{observations.length} source observation{observations.length === 1 ? '' : 's'}</span><span>{date(insight.createdAt)}</span></div></article>)}</div>}</section>
      <aside className="form-panel"><h2>Generate insight</h2><p>Select observations from one campaign. The domain rejects mixed evidence.</p>{analytics.observations.length === 0 ? <p>No observations are available.</p> : <form action={generateInsight}>{analytics.observations.map(({ observation, contentTitle, campaignName }) => <label key={observation.id} style={{ gridTemplateColumns: '20px 1fr', alignItems: 'start' }}><input type="checkbox" name="observationIds" value={observation.id} style={{ width: 16 }} /><span>{contentTitle}<small style={{ display: 'block' }}>{campaignName} · {date(observation.observedAt)}</small></span></label>)}<button className="button primary">Generate rule-based insight</button></form>}</aside></div>
  </>;
}
