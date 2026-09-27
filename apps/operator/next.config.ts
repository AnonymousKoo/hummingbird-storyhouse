import type { NextConfig } from 'next';

const config: NextConfig = {
  agentRules: false,
  outputFileTracingRoot: new URL('../..', import.meta.url).pathname,
  serverExternalPackages: ['pg']
};

export default config;
