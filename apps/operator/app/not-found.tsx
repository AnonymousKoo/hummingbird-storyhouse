import Link from 'next/link';
export default function NotFound() { return <div className="empty"><span>404</span><h1>That story isn’t here.</h1><p>The record may have moved or belongs to another tenant.</p><Link className="button primary" href="/">Return to Command Center</Link></div>; }
