'use client';
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) { return <div className="empty"><span>!</span><h1>We hit an operational snag.</h1><p>The database may be unavailable or the environment may be incomplete.</p><button className="button primary" onClick={reset}>Try again</button></div>; }
