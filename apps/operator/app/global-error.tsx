'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return <html lang="en"><body><main><div className="empty"><span>!</span><h1>Operator workspace unavailable.</h1><p>Check the local database and required environment, then try again.</p><button className="button primary" onClick={reset}>Try again</button></div></main></body></html>;
}
