const path = require('path');
const { loadEnvConfig } = require('@next/env');

// .env.local lives one level up (at the repo root, alongside the original HTML files) rather
// than in this Next.js project's own directory. Next.js only auto-loads env files from its own
// root, so this explicitly loads the parent folder's env file too.
//
// The 4th arg (forceReload=true) is required: Next's own CLI already calls loadEnvConfig() for
// THIS project's root before next.config.js is ever evaluated, and @next/env caches that result
// at module scope. Without forceReload, this call silently returns the stale (empty) cache
// instead of actually reading the parent directory.
loadEnvConfig(path.join(__dirname, '..'), process.env.NODE_ENV === 'development', console, true);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // loadEnvConfig() above populates process.env for server-side code just fine, but Next's
  // client-bundle env inlining doesn't reliably pick up vars set this way (verified: they were
  // silently missing from the built client chunks). The `env` key here is the documented,
  // supported way to force specific values into both server and client bundles regardless of
  // where they came from.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },
};

module.exports = nextConfig;
