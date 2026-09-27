import Link from 'next/link';
import type { ReactNode } from 'react';
import { tenantLabel } from '../server/runtime';

const navigation = [
  ['/', 'Command Center', 'CC'], ['/brands', 'Brands', 'BR'], ['/campaigns', 'Campaigns', 'CA'],
  ['/content', 'Content', 'CO'], ['/approvals', 'Approvals', 'AP'], ['/distribution', 'Distribution', 'DI'],
  ['/analytics', 'Analytics', 'AN'], ['/insights', 'Insights', 'IN'], ['/commerce', 'Commerce', 'CM']
] as const;

export function Sidebar() {
  return <aside className="sidebar">
    <Link href="/" className="wordmark"><span className="mark">H</span><span>Hummingbird<br /><em>Storyhouse</em></span></Link>
    <div className="internal-badge"><i /> Internal operator</div>
    <nav aria-label="Primary navigation">
      {navigation.map(([href, name, short]) => <Link href={href} key={href}><span className="nav-icon">{short}</span>{name}</Link>)}
    </nav>
    <div className="sidebar-foot"><span>Current tenant</span><strong>{tenantLabel()}</strong><small>Local environment</small></div>
  </aside>;
}

export function Topbar() {
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
  return <header className="topbar"><div><span className="eyebrow">Operating day</span><strong>{today}</strong></div><Link href="/content#new" className="button primary">＋ New brief</Link></header>;
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</header>;
}

export function Notice({ error, success }: { error?: string; success?: string }) {
  if (error) return <div className="notice error" role="alert">{error}</div>;
  if (success) return <div className="notice success" role="status">Saved. The operating view is up to date.</div>;
  return null;
}

export function Status({ value }: { value: string }) { return <span className={`status status-${value}`}>{value.replaceAll('_', ' ')}</span>; }

export function Empty({ title, children }: { title: string; children: ReactNode }) {
  return <div className="empty"><span>✦</span><h3>{title}</h3><p>{children}</p></div>;
}
