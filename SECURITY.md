# Security Policy

## Reporting a Vulnerability

If you discover a security issue in VenueFlow, please open a private GitHub Security Advisory or email the maintainer rather than filing a public issue. We aim to respond within 72 hours.

## Supported Versions

Only `main` is actively maintained for this hackathon submission.

## Security Controls

VenueFlow applies defense-in-depth at every layer. Each control below maps to source code so reviewers can verify it.

| Layer | Control | Source |
|-------|---------|--------|
| Configuration | Zod-validated env at startup; fails fast on missing `GEMINI_API_KEY` | `venueflow/backend/src/config/env.ts` |
| Transport | Helmet HSTS (1 yr, preload), strict CSP, frame-ancestors `none` | `venueflow/backend/src/app.ts` |
| Transport | Explicit CORS allow-list, no wildcards | `venueflow/backend/src/app.ts` |
| Application | `requireJson` 415 enforcement on POST/PUT/PATCH | `venueflow/backend/src/middleware/requireJson.ts` |
| Application | 10 KB body cap; 10 s request timeout (503) | `constants.ts`, `middleware/timeout.ts` |
| Application | Split read/write rate limiters (100 / 20 per 15 min) | `middleware/rateLimiter.ts` |
| Authentication | Firebase ID-token verification with `staff` custom claim, falling back to a constant-time shared-secret comparison for the demo surface | `middleware/requireStaffKey.ts` |
| Validation | Zod schemas on every POST body and on every Firestore read | `routes/*.ts`, `schemas/firestore.ts` |
| Output | `xss` library sanitises every user-supplied string before it reaches Gemini or Realtime DB | `utils/sanitize.ts` |
| Operations | Structured JSON logs with per-request `X-Request-Id` | `utils/logger.ts`, `middleware/requestId.ts` |
| Supply chain | `npm audit --omit=dev --audit-level=high` and GitHub `dependency-review-action` are blocking CI steps | `.github/workflows/ci.yml` |

## Secret Management

Secrets are never committed. Local development reads from `.env`; Cloud Run reads from Google Cloud Secret Manager via `--set-secrets` in `cloudbuild.yaml`. Rotation procedure:

1. Add the new secret version in Secret Manager.
2. Redeploy the Cloud Run service (the new revision picks up the latest version).
3. Disable the old version after a 24-hour grace period.

## Known Prototype Limitations

- The shared `X-Staff-Key` fallback is intentionally retained for hackathon judging; production deployments should disable it by leaving `STAFF_API_KEY` unset and relying solely on Firebase Auth.
- `VITE_*` variables shipped to the browser are inherently public — anything sensitive must live behind the backend, not in `frontend/.env`.
