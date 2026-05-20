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
- Supabase for primary persistence
- localStorage as fallback resilience
- Vercel Function + AI SDK for optional AI assist
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
- Add `OPENAI_API_KEY`

Optional fallback:

- `VITE_SUPABASE_ANON_KEY` if your project still uses legacy anon keys

The app now supports Supabase-backed persistence when these values are present. Without them, it falls back to browser `localStorage`.
AI Assist uses the server-side `OPENAI_API_KEY` through the Vercel function at `/api/ai-assist`.
The AI route now includes lightweight in-memory rate limiting for MVP protection.

## Supabase setup

Run the SQL in [docs/supabase/schema.sql](/Users/mikiniwilliams/Documents/Codex/2026-05-19/you-are-building-a-web-app/docs/supabase/schema.sql:1) in the Supabase SQL Editor.

That script creates:

- `engagements`
- `discovery_responses`
- `readiness_assessments`
- `prioritized_use_cases`
- `roadmap_items`
- `export_summaries`
- `ai_artifacts`
- `updated_at` triggers
- authenticated per-user RLS policies across all exposed tables

If you already created the earlier `ai_artifacts` table, re-run the updated SQL so it picks up:

- `version_number`
- `is_current`
- `regeneration_group_id`
- `parent_artifact_id`
- current/version uniqueness indexes

Important note:

- Cloud persistence now expects Supabase Auth to be enabled.
- The app uses email magic links for the MVP sign-in flow.
- In Supabase Auth settings, make sure your site URL and redirect URLs include your Vercel app URL.

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

- Supabase is now the primary source of truth when env vars are configured and the user is signed in.
- The app persists normalized workflow records across `engagements`, discovery, readiness, use cases, roadmap items, and export summaries.
- AI drafts are persisted separately in `ai_artifacts` so they do not overwrite deterministic workflow data.
- AI artifact regenerations now create versioned history rows while preserving one current artifact per type.
- Browser `localStorage` remains as a fallback so the workflow still works if Supabase is unavailable or the user is signed out.
- Generated outputs remain editable on the readiness, prioritization, roadmap, and export screens.
- Regenerating an upstream step clears downstream outputs so the consultant can re-run the flow cleanly.

## Production gaps

- No role-based permissions beyond per-user ownership yet
- No PDF export or branded document generation
- No analytics, audit logs, or enterprise governance controls
- AI prompting and server-side model access should be hardened with rate limits, observability, and stricter validation before production
- The current rate limiting is in-memory and best suited to a single MVP deployment footprint, not a distributed production control plane

## Suggested next step

- Tighten the current auth and RLS model if you want stricter production behavior.
- Add richer exports such as PDF or branded slide output when the workflow is stable.

## Assumptions

- The repository did not already include homepage copy or wireframes, so the homepage content and layout were created to match the requested B2B SaaS direction.
- A plain-text download is sufficient for MVP export because the requirement asked for something the user can copy or download.
- Readiness scoring is intentionally deterministic and editable so consultants can inspect and override it during workshops.
- Recommendations and readiness category are still derived rules-based fields in the app layer, while the database stores the editable assessment values and summary.
