import Link from 'next/link';
import { Empty, Notice, PageHeader } from '../../components/chrome';
import { onboardBrand } from '../../server/actions';
import { queries, tenantId } from '../../server/runtime';

export const dynamic = 'force-dynamic';
export default async function Brands({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const [items, message] = await Promise.all([queries().brands(tenantId()), searchParams]);
  return <><PageHeader eyebrow="Brand intelligence" title="Brands in the house." description="Every operating decision starts with a shared understanding of purpose, audience, voice, and constraint." />
    <Notice error={message.error} success={message.success} />
    <div className="split"><section>{items.length === 0 ? <Empty title="No brands yet">Onboard the first fictional brand to establish its operating context.</Empty> : <div className="card-grid">{items.map(({ brand, activeStrategyCount, campaignCount, contentCount }) => <Link className="card" href={`/brands/${brand.id}`} key={brand.id}><span className="eyebrow">{brand.organizationName}</span><h3>{brand.name}</h3><p>{brand.profile.purpose}</p><div className="tag-list">{brand.profile.platforms.map((platform) => <span className="tag" key={platform}>{platform}</span>)}</div><div className="card-meta"><span>{activeStrategyCount} active strategies</span><span>{campaignCount} campaigns</span><span>{contentCount} pieces</span></div></Link>)}</div>}</section>
      <aside className="form-panel" id="new"><h2>Onboard a brand</h2><p>Comma-separated or one-per-line lists both work.</p><form action={onboardBrand}><label>Organization<input name="organizationName" required placeholder="Fictional Fieldwork Co." /></label><label>Brand name<input name="name" required placeholder="Kindred Current" /></label><label>Purpose<textarea name="purpose" required placeholder="Why this brand exists." /></label><label>Audiences<textarea name="audiences" required placeholder="Curious home cooks, culture-first travelers" /></label><div className="form-row"><label>Voice<textarea name="voice" required placeholder="Warm, precise" /></label><label>Objectives<textarea name="objectives" required placeholder="Build trust, grow reach" /></label></div><div className="form-row"><label>Platforms<textarea name="platforms" required placeholder="Instagram, YouTube" /></label><label>Constraints<textarea name="constraints" placeholder="No unverified claims" /></label></div><button className="button primary">Onboard brand</button></form></aside>
    </div></>;
}
