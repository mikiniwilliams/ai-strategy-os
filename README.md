# AI Strategy OS

AI Strategy OS is a lean web MVP for consultants and strategists running AI advisory engagements. It supports a focused workflow:

1. Home page
2. Create engagement
3. Discovery questionnaire
4. Readiness assessment
5. Use-case prioritization
6. Roadmap output
7. Export summary

## Stack

- React 19
- TypeScript
- Vite
- Local browser storage for persistence
- Vitest for a small logic test suite

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Deploy to Vercel

This project should be connected to Vercel as a `Vite` app, not a `Next.js` app.

Recommended Vercel settings:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

The included [vercel.json](/Users/mikiniwilliams/Documents/Codex/2026-05-19/you-are-building-a-web-app/vercel.json:1) adds a rewrite so direct visits to routes like `/discovery` and `/roadmap` still load correctly on Vercel.

## Environment variables

Use [.env.example](/Users/mikiniwilliams/Documents/Codex/2026-05-19/you-are-building-a-web-app/.env.example:1) as the template for local and Vercel-managed environment variables.

For local development:

```bash
cp .env.example .env.local
```

Then fill in your real values in `.env.local`.

For Vercel:

- Add `VITE_SUPABASE_URL`
- Add `VITE_SUPABASE_PUBLISHABLE_KEY`

Optional fallback:

- `VITE_SUPABASE_ANON_KEY` if your project still uses legacy anon keys

The app now supports Supabase-backed persistence when these values are present. Without them, it falls back to browser `localStorage`.

## Supabase setup

Run the SQL in [docs/supabase/schema.sql](/Users/mikiniwilliams/Documents/Codex/2026-05-19/you-are-building-a-web-app/docs/supabase/schema.sql:1) in the Supabase SQL Editor.

That script creates:

- an `engagements` table
- an `updated_at` trigger
- MVP read/insert/update policies for the `anon` role

Important note:

- The included policies are intentionally lightweight for MVP speed and demoability.
- They are not the right long-term security model for sensitive or multi-user client data.
- The next production step should be Supabase Auth plus user-scoped RLS policies.

## Build and test

```bash
npm run build
npm run test
```

## Project structure

```text
/docs
  /prd
  /wireframes
  /user-flows
/app
  /src
    /components
    /pages
    /lib
    /data
    /styles
  /tests
/public
README.md
```

## Product notes

- The MVP stores everything in `localStorage` and intentionally avoids backend complexity.
- When Supabase env vars are present, the app also syncs engagement snapshots to Supabase and can reload saved engagements from the homepage.
- Generated outputs remain editable on the readiness, prioritization, roadmap, and export screens.
- Regenerating an upstream step clears downstream outputs so the consultant can re-run the flow cleanly.

## Production gaps

- No authentication or user accounts
- No secure user-scoped Supabase policies yet
- No PDF export or branded document generation
- No analytics, audit logs, or enterprise governance controls
- No API-driven AI generation yet; current scoring and roadmap logic is rules-based for inspectability

## Suggested next step

- Deploy the current Vite app to Vercel now.
- Add Supabase after deployment if you want cloud-saved engagements, authentication, or multi-device access.

## Assumptions

- The repository did not already include homepage copy or wireframes, so the homepage content and layout were created to match the requested B2B SaaS direction.
- A plain-text download is sufficient for MVP export because the requirement asked for something the user can copy or download.
- Readiness scoring is intentionally deterministic and editable so consultants can inspect and override it during workshops.
