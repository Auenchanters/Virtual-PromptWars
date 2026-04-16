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

## Google Services Used (15 services)

VenueFlow integrates 15 Google Cloud services across AI, data, compute, storage, messaging, and operations:

### AI & ML
- **Gemini 2.5 Flash** (`backend/src/services/geminiService.ts`) — 4 prompt paths: conversational chatbot, crowd density summary, 15-minute predictive forecast, and crowd-aware itinerary generation. Uses `HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE` safety settings across all categories.

### Data & Storage
- **Firebase Firestore** (`backend/src/services/firestoreService.ts`) — Source of truth for crowd densities and queue wait times. Reads are cached server-side (30s TTL) and every document is Zod-validated at the read boundary.
- **Firebase Realtime Database** (`backend/src/services/realtimeService.ts`) — Staff broadcast fan-out. Every connected attendee receives push updates instantly.
- **Google Cloud Storage** (`backend/src/services/storageService.ts`) — Crowd analytics snapshots are exported as JSON files to a GCS bucket for post-event trend analysis. Runs fire-and-forget after each `/api/crowd` response.

### Compute & Deployment
- **Google Cloud Run** (`venueflow/cloudbuild.yaml` step 4) — Auto-scaling containerised backend (0–10 instances, asia-south1) with 512Mi memory and 1 vCPU.
- **Google Cloud Build** (`venueflow/cloudbuild.yaml`) — 7-step CI/CD pipeline: test → Docker build → push to Artifact Registry → Cloud Run deploy → frontend build → Firebase Hosting deploy.
- **Google Artifact Registry** (`venueflow/cloudbuild.yaml` step 3) — Container image storage for all Cloud Run deployments (`gcr.io/$PROJECT_ID/venueflow-backend`).
- **Firebase Hosting** (`venueflow/firebase.json`) — Frontend CDN deployment with SPA rewrites for client-side routing.

### Serverless Functions & Event-Driven
- **Firebase Cloud Functions (gen2)** (`venueflow/functions/src/index.ts`) — 4 exported functions: Firestore triggers for crowd updates and staff announcements, a Pub/Sub consumer for high-density alerts, and a Cloud Scheduler job for daily analytics digests.
- **Google Cloud Scheduler** (`venueflow/functions/src/index.ts` — `dailyAnalyticsDigest`) — Triggers a daily Cloud Function to generate crowd analytics digest reports.
- **Google Cloud Pub/Sub** (`venueflow/functions/src/index.ts` — `onCrowdAlert`) — Event-driven messaging for high-density crowd alerts. Decouples alert production (backend) from alert consumption (Cloud Functions).

### Operations & Security
- **Google Cloud Logging** (`backend/src/utils/logger.ts` + `backend/src/services/loggingService.ts`) — Every log line is structured JSON automatically parsed by Cloud Logging via Cloud Run stdout capture. Includes `logging.googleapis.com/labels` for service-level filtering.
- **Google Cloud Secret Manager** (`venueflow/cloudbuild.yaml` — `--set-secrets`) — All sensitive environment variables (GEMINI_API_KEY, FIREBASE_PRIVATE_KEY, STAFF_API_KEY, etc.) are injected at runtime from Secret Manager.
- **Firebase Authentication** (`backend/src/middleware/requireStaffKey.ts`) — Staff identity verification via Firebase ID-token or shared-secret fallback with `crypto.timingSafeEqual`.

### Frontend
- **Google Maps JavaScript API** (`frontend/src/components/StadiumMap.tsx`) — Interactive stadium floor plan with density-coloured `MarkerF` components via `@react-google-maps/api`.

## Failure Modes

| Failure | Behaviour |
|---------|-----------|
| Firestore unavailable | Route returns 500 via `errorHandler`; cache continues to serve stale entries until TTL expires. |
| Gemini upstream error | `chatWithGemini` and `generateItinerary` rethrow (errorHandler → 500). `generateCrowdSummary` and `generateCrowdForecast` swallow errors and return a friendly fallback string so the dashboard never goes blank. |
| Firestore document fails Zod validation | Document dropped, warning logged with id and issues; rest of the snapshot still served. |
| Request exceeds 10 s | `requestTimeout` middleware emits a 503 envelope; the upstream call is left running but its response is ignored. |
