import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Sidebar, Topbar } from '../components/chrome';
import './globals.css';

export const metadata: Metadata = { title: 'Hummingbird Storyhouse · Operator', description: 'Internal editorial operations workspace' };
export const runtime = 'nodejs';

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><div className="app-shell"><Sidebar /><div className="main-shell"><Topbar /><main>{children}</main><footer>Hummingbird Storyhouse · Internal use only</footer></div></div></body></html>;
}
