# VenueFlow Architecture

## High-level Topology

```text
Browser (React 18 + TS, Firebase Hosting / Cloud Run static)
   │   HTTPS · same-origin or allow-listed CORS
   ▼
Cloud Run (Node 18 + Express + TS)
   ├── /api/crowd      → Firestore (cached 30 s)
   ├── /api/queue      → Firestore (cached 30 s)
   ├── /api/gemini/*   → Gemini 2.5 Flash (cached, single-flight)
   └── /api/staff/*    → Firebase Auth ID-token OR shared key → Realtime DB
```

The backend is the single source of truth for: authentication, rate limiting, response caching, and prompt grounding. The frontend is intentionally thin — no business logic, only presentation and direct Firebase RTDB subscriptions for staff broadcasts.

## Request Lifecycle

1. `requestId` middleware mints or echoes `X-Request-Id` so every log line and error envelope can be cross-referenced.
2. `requestTimeout(10s)` arms a wall-clock guard — Gemini stalls cannot pin a Cloud Run slot.
3. Route-specific rate limiter (`readLimiter` for GETs, `writeLimiter` for Gemini/staff).
4. `requireJson` rejects non-JSON POST bodies with 415.
5. `express.json({ limit: '10kb' })` parses the body.
6. Route-level Zod schema validates the parsed body.
7. Service layer executes (Firestore read, Gemini call, RTDB write).
8. `errorHandler` catches anything thrown and returns a sanitized envelope; full error is logged with the request id.

## Caching Strategy

| Cache | Key | TTL | Why |
|-------|-----|-----|-----|
| `firestoreService.cache` | `crowd_data` / `queue_data` | 30 s | Crowd density refreshes slowly; saves Firestore reads at scale. |
| `geminiService.responseCache` | `<namespace>:<sha256(payload)[:32]>` | 30 s | Repeat FAQs ("where is gate 4?") never re-hit Gemini. |
| `geminiService.forecastCache` | `forecast:<sha256>` | 60 s | Forecast endpoint refreshes every minute on the dashboard. |
| `geminiService.inflight` | same key as response cache | request lifetime | Single-flight: concurrent identical requests share one in-flight promise instead of issuing N parallel Gemini calls. |

## Authentication

Two paths, evaluated in order on `/api/staff/*`:

1. `Authorization: Bearer <Firebase ID token>` — verified via `admin.auth().verifyIdToken`. Requires a `staff: true` (or `role === 'staff'`) custom claim. Staff UID is attached to the request for audit logging.
2. `X-Staff-Key: <shared secret>` — constant-time `crypto.timingSafeEqual` comparison. Retained for hackathon judging; production deployments should leave `STAFF_API_KEY` unset.

## Accessibility

- Every page is reached through `<main id="main-content" tabIndex={-1}>`. The custom `useRouteFocus` hook moves focus to `main` on every pathname change so screen readers announce the new heading.
- The chat dialog uses `useFocusTrap`, which cycles Tab through visible, enabled, non-`aria-hidden` elements only and closes on Escape.
- jest-axe runs WCAG audits on every page-level component in CI; failures block merge.
- `prefers-reduced-motion: reduce` is honoured in `index.css`.

## Google Services Used

- **Gemini 2.5 Flash** — chat, summary, forecast, itinerary (4 prompt paths) with explicit `safetySettings`.
- **Firebase Firestore** — crowd + queue data, with Zod-validated reads.
- **Firebase Realtime Database** — staff broadcasts, streamed to attendees.
- **Firebase Authentication** — staff identity (with shared-secret fallback for the demo).
- **Google Maps JavaScript API** — stadium overlay with density-coloured markers.
- **Google Cloud Run + Cloud Build** — containerised deployment.
- **Google Cloud Secret Manager** — runtime injection of API keys via `--set-secrets`.

## Failure Modes

| Failure | Behaviour |
|---------|-----------|
| Firestore unavailable | Route returns 500 via `errorHandler`; cache continues to serve stale entries until TTL expires. |
| Gemini upstream error | `chatWithGemini` and `generateItinerary` rethrow (errorHandler → 500). `generateCrowdSummary` and `generateCrowdForecast` swallow errors and return a friendly fallback string so the dashboard never goes blank. |
| Firestore document fails Zod validation | Document dropped, warning logged with id and issues; rest of the snapshot still served. |
| Request exceeds 10 s | `requestTimeout` middleware emits a 503 envelope; the upstream call is left running but its response is ignored. |
