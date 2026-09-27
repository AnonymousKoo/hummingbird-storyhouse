import Link from 'next/link';
import { productionPath } from 'hummingbird-storyhouse-core';
import { Empty, Notice, PageHeader } from '../../components/chrome';
import { label } from '../../lib/format';
import { createContentBrief } from '../../server/actions';
import { queries, tenantId } from '../../server/runtime';

export const dynamic = 'force-dynamic';
export default async function Content({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const service = queries(); const [items, campaigns, message] = await Promise.all([service.content(tenantId()), service.campaigns(tenantId()), searchParams]);
  const activeCampaigns = campaigns.filter((item) => item.campaign.status === 'active');
  return <><PageHeader eyebrow="Editorial production" title="Every story has a next move." description="A production board from completed brief through publication. State changes follow the core’s transition rules." />
    <Notice error={message.error} success={message.success} />
    {items.length === 0 ? <Empty title="The board is waiting">Create the first brief from an active campaign.</Empty> : <section className="board">{productionPath.slice(1).map((state) => { const group = items.filter((item) => item.content.state === state); return <div className="board-column" key={state}><div className="board-head"><span>{label(state)}</span><span>{group.length}</span></div>{group.map((item) => <Link href={`/content/${item.content.id}`} className="board-item" key={item.content.id}><strong>{item.content.title}</strong><small>{item.brandName}<br />{item.campaignName}</small></Link>)}</div>; })}</section>}
    <section className="form-panel" id="new" style={{ marginTop: 38 }}><div className="page-header"><div><span className="eyebrow">New work</span><h2>Create a content brief</h2><p>A completed brief starts in the brief state.</p></div></div>{activeCampaigns.length === 0 ? <div className="notice error">No active campaign exists. Create a campaign from an active strategy first.</div> : <form action={createContentBrief}><div className="form-row"><label>Campaign<select name="campaignId" required>{activeCampaigns.map((item) => <option key={item.campaign.id} value={item.campaign.id}>{item.brandName} · {item.campaign.name}</option>)}</select></label><label>Format<input name="format" placeholder="vertical video" /></label></div><label>Working title<input name="title" required placeholder="A table set by memory" /></label><label>Core idea<textarea name="idea" required placeholder="The single idea this story should land." /></label><label>Opening hooks<textarea name="hooks" required placeholder="One heirloom. Three generations.&#10;What if a recipe could remember?" /></label><label>Creative brief<textarea name="brief" required placeholder="Audience, narrative movement, proof points, and execution notes." /></label><label>Call to action<input name="cta" required placeholder="Save this for your next gathering." /></label><button className="button primary">Create brief</button></form>}</section>
  </>;
}
