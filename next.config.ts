import type { NextConfig } from 'next';
const config: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  distDir: process.env.NEXT_DIST_DIR || '.next',
};
export default config;
