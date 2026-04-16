# VenueFlow — Smart Stadium Experience Platform

> **PromptWars Hackathon** | Hack2Skill × Google Cloud | Challenge: Physical Event Experience

[![Cloud Run](https://img.shields.io/badge/Cloud%20Run-Deployed-blue)](https://venueflow-backend-608358746679.asia-south1.run.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-green)](https://www.w3.org/WAI/WCAG21/quickref/)

VenueFlow is an AI-powered smart stadium experience platform that solves the three core challenges of large-scale sporting events: **crowd movement**, **waiting times**, and **real-time coordination**. It combines a real-time crowd heatmap, smart queue estimation, a Gemini-powered venue chatbot, live staff broadcasts, and personalised itineraries into a single, accessible web app.

## Chosen Vertical

**Physical Event Experience** — the challenge of making large sporting venues safer, faster, and more enjoyable for attendees through live data and AI-assisted guidance.

## Problem → Solution Mapping

| Challenge | VenueFlow Feature | How It Helps |
|-----------|------------------|--------------|
| **Crowd Movement** | Live Crowd Heatmap + Google Maps overlay | Real-time colour-coded density (LOW/MEDIUM/HIGH) so attendees avoid congested zones before they form |
| **Waiting Times** | Smart Queue Estimator | Live wait times for gates, concessions, and restrooms — reads Firestore through a 30s-cached endpoint |
| **Real-Time Coordination** | Staff Broadcast Feed | Staff push alerts through Firebase Realtime Database, streamed to every connected attendee |
| **Attendee Guidance** | Gemini AI Chatbot | Natural-language Q&A about gates, food, vegan options, and facilities (grounded prompt) |
| **Personalisation** | AI Itinerary & 15-min Forecast | Gemini produces a crowd-aware plan per seat section and a short predictive outlook for the next 15 minutes |
| **Operational Analytics** | Cloud Functions + Cloud Logging | Every crowd density change and staff broadcast is captured as a structured log event for post-event analysis |

## Approach and Logic

Large-venue pain points are almost always caused by **information asymmetry**: attendees don't know where the crowd is, how long queues are, or what operations is about to announce. VenueFlow collapses that asymmetry by pairing three data sources:

1. **Firestore** acts as the source of truth for crowd densities and queue wait times. A lightweight server cache (30s TTL) keeps reads cheap and responsive without starving the live signal.
2. **Firebase Realtime Database** carries operational push messages from staff (gate openings, delays, medical alerts) so coordination is instant rather than polled.
3. **Gemini 2.5 Flash** turns raw data into human guidance — summarising density, predicting the next 15 minutes, answering venue questions, and generating itineraries that actively route attendees away from HIGH-density sections.
4. **Firebase Cloud Functions (gen2)** react to every Firestore write in real time, emitting structured analytics events to **Google Cloud Logging** so venue operators can query density patterns and audit every staff broadcast after the event.

The front-end renders the same state through three complementary views (heatmap grid, Google Maps overlay, queue list) so attendees can self-serve regardless of how they think spatially. Every surface is screen-reader friendly and keyboard navigable.

## How the Solution Works

1. An attendee opens the web app and lands on the **Home** page, which explains the features and offers a single entry point into the Dashboard.
2. On the **Dashboard** the attendee sees three live signals side-by-side:
   - The **Stadium Crowd Heatmap** (coloured grid of sections)
   - The **Google Maps** stadium overlay with density-coloured markers
   - The **Live Wait Times** list for gates, concessions, and restrooms
3. A **15-Minute Crowd Outlook** (Gemini) refreshes every 60 seconds and proactively suggests less-crowded alternatives.
4. The floating **Venue Assistant** chatbot answers arbitrary questions grounded in stadium context (entry gates, vegan stands, etc.).
5. The **Itinerary Planner** asks for the user's seat section and returns a Gemini-generated schedule — if the section is HIGH density, Gemini is explicitly prompted to suggest a quieter route.
6. Operations staff open the **Staff** page, authenticate with the shared `X-Staff-Key` header, and push broadcasts via Realtime DB. Every attendee browser receives them instantly.
7. **In the background**, every crowd update and staff broadcast triggers a Firebase Cloud Function that writes a structured log entry to Google Cloud Logging — giving venue operators a full, queryable audit trail after the event.

## Architecture

```text
Attendee (React + TypeScript Frontend on Firebase Hosting)
         │
         ▼
Cloud Run Backend (Node.js 18 + Express + TypeScript)
    │            │              │
    ▼            ▼              ▼
 Gemini      Firestore      Realtime DB
 2.5 Flash   (crowd,        (staff
 (AI)         queues)        broadcasts)
    │            │              │
    ▼            ▼──────────────┘
Google Maps   Cloud Functions (gen2)
JS API        (Firestore triggers)
                   │
                   ▼
           Google Cloud Logging
           (structured audit trail)
```

## Google Services Used

VenueFlow integrates **15 distinct Google Cloud services** across AI, data, compute, storage, messaging, and operations:

| # | Service | Role | Where in Code |
|---|---------|------|---------------|
| 1 | **Gemini 2.5 Flash** (AI/ML API) | Chatbot, crowd summary, 15-min forecast, itinerary planner — 4 distinct prompt paths | `backend/src/services/geminiService.ts` |
| 2 | **Google Maps JavaScript API** | Interactive stadium floor plan with live density-coloured markers | `frontend/src/components/StadiumMap.tsx` via `@react-google-maps/api` |
| 3 | **Firebase Firestore** | Crowd density + queue wait-time data store with Zod-validated reads | `backend/src/services/firestoreService.ts` — TTL-cached (30 s) |
| 4 | **Firebase Realtime Database** | Instant staff broadcast push to all connected attendees | `backend/src/services/realtimeService.ts` — fan-out writes |
| 5 | **Firebase Authentication** | Staff identity verification with shared-secret fallback | `backend/src/middleware/requireStaffKey.ts` — `crypto.timingSafeEqual` |
| 6 | **Firebase Hosting** | Frontend CDN deployment with SPA rewrites | `venueflow/firebase.json` — `hosting.rewrites` |
| 7 | **Firebase Cloud Functions (gen2)** | Firestore triggers, Pub/Sub consumer, Cloud Scheduler job | `venueflow/functions/src/index.ts` — 4 exported functions |
| 8 | **Google Cloud Run** | Auto-scaling containerised backend (0–10 instances, asia-south1) | `venueflow/cloudbuild.yaml` step 4 — `gcloud run deploy` |
| 9 | **Google Cloud Build** | CI/CD pipeline: lint → test → Docker build → deploy | `venueflow/cloudbuild.yaml` — 7-step pipeline |
| 10 | **Google Cloud Storage** | Crowd analytics snapshot export for post-event analysis | `backend/src/services/storageService.ts` — `admin.storage().bucket()` |
| 11 | **Google Cloud Logging** | Structured operational audit trail (JSON-formatted, auto-parsed) | `backend/src/utils/logger.ts` + `backend/src/services/loggingService.ts` |
| 12 | **Google Cloud Scheduler** | Daily analytics digest trigger via scheduled Cloud Function | `venueflow/functions/src/index.ts` — `dailyAnalyticsDigest` |
| 13 | **Google Cloud Pub/Sub** | Event-driven high-density crowd alerts across microservices | `venueflow/functions/src/index.ts` — `onCrowdAlert` |
| 14 | **Google Artifact Registry** | Container image storage for Cloud Run deployments | `venueflow/cloudbuild.yaml` step 3 — `gcr.io/$PROJECT_ID/...` |
| 15 | **Google Cloud Secret Manager** | Runtime API key injection for all sensitive environment variables | `venueflow/cloudbuild.yaml` — `--set-secrets=GEMINI_API_KEY=...` |

## Tech Stack

- **Backend:** Node.js 18, Express.js, TypeScript (strict mode), Zod, Helmet, `xss`, `express-rate-limit`, `node-cache`, `compression`
- **Frontend:** React 18, TypeScript (strict), React Router v6, Tailwind CSS, Vite, `@react-google-maps/api`, Firebase SDK
- **Functions:** Firebase Cloud Functions v4 (gen2), TypeScript, `firebase-functions` logger → Google Cloud Logging
- **Testing:** Jest, ts-jest, Supertest (backend E2E), @testing-library/react, jest-axe (frontend a11y)
- **DevOps:** Docker (multi-stage), Google Cloud Run, Cloud Build, Artifact Registry, Firebase Hosting

## Live Demo

- **Backend API:** https://venueflow-backend-608358746679.asia-south1.run.app
- **Health Check:** https://venueflow-backend-608358746679.asia-south1.run.app/health
- **Frontend:** Deploy to Firebase Hosting using the instructions in the **Deployment** section below, or run locally with `npm run dev`.

## Project Structure

```text
Virtual-PromptWars/
└── venueflow/
    ├── backend/
    │   ├── src/
    │   │   ├── app.ts                    # Express app (no listen — testable)
    │   │   ├── server.ts                 # Server entry point (app.listen)
    │   │   ├── config/
    │   │   │   ├── env.ts                # Zod-validated environment variables
    │   │   │   ├── constants.ts          # Centralised constants and limits
    │   │   │   └── firebaseAdmin.ts      # Firebase Admin SDK init (service account or ADC)
    │   │   ├── middleware/
    │   │   │   ├── errorHandler.ts       # Global error handler
    │   │   │   ├── rateLimiter.ts        # 100 read / 20 write req per 15 min per IP
    │   │   │   ├── requestId.ts          # X-Request-Id tracing
    │   │   │   ├── requireJson.ts        # Content-Type enforcement
    │   │   │   └── requireStaffKey.ts    # Staff auth (crypto.timingSafeEqual)
    │   │   ├── routes/
    │   │   │   ├── crowd.ts              # GET /api/crowd
    │   │   │   ├── queue.ts              # GET /api/queue
    │   │   │   ├── gemini.ts             # POST /api/gemini/chat | /itinerary | /forecast
    │   │   │   └── staff.ts              # POST /api/staff/broadcast
    │   │   ├── schemas/
    │   │   │   ├── firestore.ts          # Zod schemas for Firestore documents
    │   │   │   └── requests.ts           # Zod schemas for API request validation
    │   │   ├── services/
    │   │   │   ├── firestoreService.ts   # Crowd + queue data (cached)
    │   │   │   ├── geminiService.ts      # Gemini AI integration (4 prompts)
    │   │   │   ├── loggingService.ts     # Structured Cloud Logging events
    │   │   │   ├── realtimeService.ts    # Firebase RTDB broadcasts
    │   │   │   └── storageService.ts     # Cloud Storage analytics export
    │   │   ├── types/index.ts            # Shared TypeScript interfaces
    │   │   ├── utils/
    │   │   │   ├── sanitize.ts           # XSS sanitisation (xss library)
    │   │   │   └── logger.ts             # Structured JSON logging for Cloud Logging
    │   │   └── scripts/seedFirestore.ts  # Populate demo data
    │   ├── __tests__/                    # Jest + Supertest suites
    │   └── Dockerfile
    ├── functions/
    │   ├── src/
    │   │   └── index.ts                  # Cloud Functions (gen2) — Firestore, Pub/Sub, Scheduler triggers
    │   ├── package.json
    │   └── tsconfig.json
    └── frontend/
        ├── src/
        │   ├── App.tsx                   # Routing + skip-to-content link
        │   ├── main.tsx                  # React entry point
        │   ├── components/
        │   │   ├── Navbar.tsx            # Semantic <nav> landmark
        │   │   ├── CrowdHeatmap.tsx      # Accessible list of density cells
        │   │   ├── StadiumMap.tsx        # Google Maps density overlay
        │   │   ├── QueueStatus.tsx       # Live wait times
        │   │   ├── GeminiChatbot.tsx     # Modal chatbot (focus trap)
        │   │   ├── ItineraryPlanner.tsx  # Personalised plan generator
        │   │   ├── CrowdForecast.tsx     # 15-min outlook (aria-live)
        │   │   ├── StaffFeed.tsx         # Real-time broadcast stream
        │   │   └── AccessibleAlert.tsx   # role="alert" wrapper
        │   ├── pages/                    # HomePage, DashboardPage, StaffPage
        │   ├── hooks/                    # useGemini, useCrowdData, useFocusTrap
        │   ├── services/                 # api.ts, firebase.ts
        │   ├── utils/                    # density helpers, sanitize, constants
        │   └── types/index.ts            # Shared interfaces
        └── __tests__/                    # Jest + @testing-library/react + jest-axe
```

## Local Setup

### Prerequisites
- Node.js v18+
- Google Cloud Project with Cloud Run + Firestore + Cloud Functions enabled
- Firebase Project with Realtime Database enabled
- Gemini API Key from [Google AI Studio](https://aistudio.google.com)

### Backend

```bash
cd venueflow/backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Frontend

```bash
cd venueflow/frontend
npm install
npm run dev
```

### Cloud Functions (local emulator)

```bash
cd venueflow/functions
npm install
npm run serve   # starts Firebase Functions emulator
```

## Environment Variables

### Backend (`venueflow/backend/.env`)

```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FRONTEND_URL=https://your-frontend-domain.com
STAFF_API_KEY=your_shared_staff_secret
```

### Frontend (`venueflow/frontend/.env`)

```env
VITE_API_BASE_URL=https://your-backend-url.run.app/api
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
VITE_STAFF_API_KEY=your_shared_staff_secret
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Note:** `VITE_GOOGLE_MAPS_API_KEY` must be restricted to your frontend domain in the Google Cloud Console in production.

## Deployment

### Backend (Cloud Run)

```bash
cd venueflow/backend
gcloud run deploy venueflow-backend \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated
```

Or use the provided `cloudbuild.yaml` for a full CI/CD pipeline (tests → Docker build → Artifact Registry → Cloud Run deploy → frontend build → Firebase Hosting deploy).

### Frontend (Firebase Hosting)

```bash
cd venueflow/frontend
npm run build
cd ..
firebase deploy --only hosting
```

### Cloud Functions

```bash
cd venueflow/functions
npm run build
cd ..
firebase deploy --only functions
```

## Testing

### Backend tests

```bash
cd venueflow/backend
npm test                 # all Jest suites
npm run test:coverage    # enforces 85% global / 95% routes & utils thresholds
```

Covers HTTP boundary (Supertest), security headers, rate limiting, Zod validation, XSS sanitisation, Firestore caching, and Realtime DB writes.

### Frontend tests

```bash
cd venueflow/frontend
npm test                 # Jest + @testing-library/react + jest-axe
```

Covers component rendering, hooks, API client behaviour, and **programmatic WCAG audits** via `jest-axe` on Navbar, CrowdHeatmap, QueueStatus, StadiumMap, CrowdForecast, ItineraryPlanner, and AccessibleAlert.

### Seed Demo Data

```bash
cd venueflow/backend
npm run seed             # 12 crowd sections + 10 queue entries into Firestore
```

## Security

Defense-in-depth is applied at every layer:

- **Secrets:** never hardcoded — validated at startup by Zod in `src/config/env.ts`, which fails fast on misconfiguration
- **HTTP headers:** Helmet with strict CSP, HSTS (1 year, preload), referrer policy, frame-ancestors `none`
- **Rate limiting:** split limiters — 100 read requests / 15 min and 20 write requests / 15 min per IP
- **Request body size:** 10 KB hard cap
- **Input validation:** Zod schemas on every POST; `xss` library sanitises all user-supplied strings before they reach Gemini or Realtime DB
- **CORS:** explicit origin allow-list (no wildcards), restricted methods (`GET`, `POST`, `OPTIONS`)
- **Staff authentication:** `crypto.timingSafeEqual` comparison on the `X-Staff-Key` header — constant-time, immune to timing attacks
- **Content-Type enforcement:** non-JSON POST/PUT/PATCH requests rejected with `415`
- **Request tracing:** every response carries a unique `X-Request-Id` for log correlation

### Prototype Limitations

- **Staff authentication** uses a shared `X-Staff-Key` secret. In production this would be replaced with Firebase Auth ID-token verification and per-staff roles. The backend comparison is the real security boundary — the frontend `VITE_STAFF_API_KEY` is inherently visible in the shipped JS bundle (standard Vite behaviour for `VITE_*` vars) and is only included to make the demo Staff page usable.
- **Firestore reads** are cast to typed shapes without runtime validation; a production deployment would add Zod validation at the service boundary.

## Accessibility

VenueFlow is built to **WCAG 2.1 AA** standards:

- **Semantic HTML5 landmarks:** `<header>`, `<nav>`, `<main>`, `<section>` used throughout
- **Skip-to-content link** (visible on keyboard focus) jumps past the navbar to `#main-content`
- **ARIA roles and labels** on every interactive element (`role="dialog"`, `aria-modal`, `role="alert"`, `aria-live="polite"`, `role="list"`/`listitem` for the heatmap)
- **Focus management:** custom `useFocusTrap` hook traps focus inside modals; focus is restored on close; Escape closes dialogs
- **Visible focus rings** on every focusable element (Tailwind `focus:ring-*`)
- **Colour contrast:** 4.5:1 minimum ratio throughout
- **Automated audits:** `jest-axe` runs a WCAG compliance check on every page-level component in CI; `eslint-plugin-jsx-a11y` enforces static a11y rules at lint time

## Assumptions

- Stadium sections are pre-seeded in Firestore via `npm run seed`; if the collections are empty the backend falls back to deterministic mock data so the demo is never broken
- Staff authentication is a shared secret for this hackathon prototype; a production deployment would use Firebase Auth with role-based access control
- Crowd density updates are treated as crowdsourced and cached server-side for 30 seconds to balance freshness against Firestore read cost
- Gemini responses are best-effort — every AI call falls back to a friendly, static message if the upstream API fails so the UI never appears broken
- Cloud Functions run in the same Firebase project; the `logger` output is automatically ingested by Google Cloud Logging with no additional configuration

## License

MIT © 2026 Utkarsh Singh Yadav
