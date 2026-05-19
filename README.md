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
- Generated outputs remain editable on the readiness, prioritization, roadmap, and export screens.
- Regenerating an upstream step clears downstream outputs so the consultant can re-run the flow cleanly.

## Production gaps

- No authentication or user accounts
- No shared persistence or database
- No PDF export or branded document generation
- No analytics, audit logs, or enterprise governance controls
- No API-driven AI generation yet; current scoring and roadmap logic is rules-based for inspectability

## Assumptions

- The repository did not already include homepage copy or wireframes, so the homepage content and layout were created to match the requested B2B SaaS direction.
- A plain-text download is sufficient for MVP export because the requirement asked for something the user can copy or download.
- Readiness scoring is intentionally deterministic and editable so consultants can inspect and override it during workshops.
