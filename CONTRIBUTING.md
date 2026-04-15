# Contributing to VenueFlow

Thanks for taking the time to contribute. This document captures the conventions that keep the codebase reviewable.

## Development Setup

```bash
# Backend
cd venueflow/backend
npm ci
cp .env.example .env   # fill values
npm run dev

# Frontend (separate terminal)
cd venueflow/frontend
npm ci
npm run dev
```

## Required Checks Before Opening a PR

Run from the package root that you touched:

```bash
npm run lint
npm run typecheck
npm test            # backend: jest + supertest; frontend: jest + jest-axe
```

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) re-runs all of these plus `npm audit --audit-level=high` and a GitHub `dependency-review-action`. PRs cannot merge until every job is green.

## Code Style

- **TypeScript strict mode** — no `any`, no `@ts-ignore`. `noUncheckedIndexedAccess` is on; use optional chaining or non-null assertions deliberately.
- **No new comments unless the WHY is non-obvious.** Function and variable names should explain WHAT.
- **JSDoc** is required on every exported async service function — include `@throws` for the error contract.
- **Imports** are grouped: node built-ins, third-party, local. ESLint enforces order.

## Adding a New Endpoint

1. Add a Zod schema for the request body in the route file.
2. Wire the route under `/api/<area>` in [src/app.ts](venueflow/backend/src/app.ts) — the read or write rate limiter is selected here, not in the route itself.
3. Add a Supertest case to `__tests__/<area>.test.ts` covering: happy path, missing field (400), invalid type (400), and (for write routes) auth failure (401/403).

## Adding a New UI Component

1. Use semantic HTML landmarks (`section`, `nav`, `main`) with `aria-labelledby` pointing at a heading.
2. Every interactive element must have a visible focus ring (Tailwind `focus:ring-*`) and a keyboard handler.
3. Add the component to the `componentCases` array in [frontend/__tests__/a11y.test.tsx](venueflow/frontend/__tests__/a11y.test.tsx) so jest-axe audits it.

## Commit Style

Conventional commits with a scope: `fix(venueflow): …`, `feat(venueflow): …`, `chore(ci): …`. The git log is the canonical changelog.
