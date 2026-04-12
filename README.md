# VenueFlow — Smart Stadium Experience Platform

> **PromptWars Hackathon** | Hack2Skill × Google Cloud | Challenge: Physical Event Experience

[![Cloud Run](https://img.shields.io/badge/Cloud%20Run-Deployed-blue)](https://venueflow-backend-608358746679.asia-south1.run.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-green)](https://www.w3.org/WAI/WCAG21/quickref/)

VenueFlow is an AI-powered smart stadium experience platform that solves the three core challenges of large-scale sporting events: **crowd movement**, **waiting times**, and **real-time coordination**.

## Live Demo

- **Frontend**: _Deploy to Firebase Hosting (see Deployment section below)_
- **Backend API**: https://venueflow-backend-608358746679.asia-south1.run.app
- **Health Check**: https://venueflow-backend-608358746679.asia-south1.run.app/health

## Problem → Solution Mapping

| Challenge | VenueFlow Feature | How It Helps |
|-----------|------------------|--------------|
| **Crowd Movement** | Live Crowd Heatmap | Real-time color-coded density map (LOW/MEDIUM/HIGH) so attendees avoid congested zones |
| **Waiting Times** | Smart Queue Estimator | Live wait times for gates, concessions, restrooms — updated via Firebase Realtime DB |
| **Real-Time Coordination** | Staff Broadcast Feed + Gemini AI | Staff push live alerts; AI chatbot answers any venue question instantly |
| **Personalization** | AI Itinerary Generator | Gemini creates a custom event schedule based on your seat section |

## Architecture

```
Attendee (React + TypeScript Frontend)
         |
         ▼
Cloud Run Backend (Node.js + Express)
    |         |          |
    ▼         ▼          ▼
Gemini    Firestore  Realtime DB
API 2.0   (crowd,    (staff
(AI)       queues)    broadcasts)
    |
    ▼
Google Maps JavaScript API
(heatmap overlay)
```

## Google Services Used

| Service | Purpose | Usage |
|---------|---------|-------|
| **Gemini API (gemini-2.0-flash)** | AI chatbot, crowd summaries, itinerary generation | 3 distinct use cases |
| **Google Maps JavaScript API** | Stadium map with crowd density overlays | Frontend heatmap |
| **Firebase Firestore** | Crowd density + queue wait time data | Real-time reads with 30s cache |
| **Firebase Realtime Database** | Staff broadcast messages | Live push to attendees |
| **Google Cloud Run** | Containerized backend deployment | Auto-scaling, zero-downtime |

## Tech Stack

**Backend:** Node.js 18, Express.js, Firebase Admin SDK, `@google/generative-ai`

**Frontend:** React 18, TypeScript, Tailwind CSS, Vite

**DevOps:** Docker, Google Cloud Run, Cloud Build, Artifact Registry

## Project Structure

```
Virtual-PromptWars/
└── venueflow/
    ├── backend/
    │   ├── src/
    │   │   ├── app.ts              # Express app (no listen — testable)
    │   │   ├── server.ts           # Server entry point (app.listen)
    │   │   ├── config/
    │   │   │   ├── env.ts          # Zod-validated environment variables
    │   │   │   └── firebaseAdmin.js # Firebase Admin SDK init
    │   │   ├── middleware/
    │   │   │   ├── errorHandler.ts  # Global error handler
    │   │   │   ├── rateLimiter.ts   # 100 req/15min per IP
    │   │   │   ├── requestId.ts     # X-Request-Id tracing
    │   │   │   ├── requireJson.ts   # Content-Type enforcement
    │   │   │   └── requireStaffKey.ts # Staff auth (timing-safe)
    │   │   ├── routes/
    │   │   │   ├── crowd.ts         # GET /api/crowd
    │   │   │   ├── queue.ts         # GET /api/queue
    │   │   │   ├── gemini.ts        # POST /api/gemini/chat|itinerary
    │   │   │   └── staff.ts         # POST /api/staff/broadcast
    │   │   ├── services/
    │   │   │   ├── firestoreService.ts   # Crowd + queue data (cached)
    │   │   │   ├── geminiService.ts      # Gemini AI integration
    │   │   │   └── realtimeService.ts    # Firebase RTDB broadcasts
    │   │   ├── types/
    │   │   │   └── index.ts         # Shared TypeScript interfaces
    │   │   ├── utils/
    │   │   │   ├── sanitize.ts      # XSS sanitization (xss library)
    │   │   │   └── logger.js        # Structured JSON logging
    │   │   └── scripts/
    │   │       └── seedFirestore.ts  # Populate demo data
    │   ├── __tests__/               # Jest test suites (TypeScript)
    │   └── Dockerfile
    └── frontend/
        └── src/
            ├── components/          # React UI components
            ├── pages/               # Page-level components
            ├── hooks/               # Custom React hooks
            ├── types/               # Shared TypeScript interfaces
            └── services/            # API service layer
```

## Local Setup

### Prerequisites
- Node.js v18+
- Google Cloud Project with Cloud Run + Firestore enabled
- Firebase Project with Realtime Database enabled
- Gemini API Key from [Google AI Studio](https://aistudio.google.com)

### Backend

```bash
cd venueflow/backend
npm install
cp .env.example .env   # Fill in your values
npm run dev
```

### Frontend

```bash
cd venueflow/frontend
npm install
npm run dev
```

## Environment Variables

### Backend

```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FRONTEND_URL=https://your-frontend-domain.com
STAFF_API_KEY=your_shared_staff_secret
```

### Frontend

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

> **Note:** `VITE_GOOGLE_MAPS_API_KEY` must be set for the Stadium Map heatmap overlay to render. Restrict the key to your frontend domain in production via the Google Cloud Console.

## Deployment

### Backend (Cloud Run)

```bash
cd venueflow/backend
gcloud run deploy venueflow-backend \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated
```

### Frontend (Firebase Hosting)

```bash
cd venueflow/frontend
npm run build
cd ..
firebase deploy --only hosting
```

## Testing

```bash
cd venueflow/backend
npm test                 # Run all TypeScript test suites
npm run test:coverage    # Run with coverage report (85% global, 95% routes/utils)
```

### Seed Demo Data

```bash
cd venueflow/backend
npm run seed             # Populate Firestore with 12 crowd sections + 10 queue entries
```

## Security

- All API keys stored in environment variables — never hardcoded
- Helmet.js with full CSP, HSTS, and referrer policy configuration
- Express rate limiting: 100 requests per 15 minutes per IP
- Request body size limit: 10kb
- Input validation via Zod schemas with XSS sanitization (`xss` library) on all POST routes
- Environment variables validated at startup via Zod (`src/config/env.ts`) — fails fast on misconfiguration
- CORS restricted to explicit frontend origin
- `crypto.timingSafeEqual` for staff key comparison (prevents timing attacks)

### Prototype Limitations

- **Staff authentication** uses a shared `X-Staff-Key` secret compared with `crypto.timingSafeEqual`. In a production deployment, this would be replaced with Firebase Auth ID-token verification. See `.env.example` for configuration.

## Accessibility

VenueFlow is built to **WCAG 2.1 AA** standards:

- Semantic HTML5 landmarks (`<main>`, `<nav>`, `<header>`, `<section>`)
- ARIA roles and labels on all interactive components
- Skip navigation link for keyboard users
- Minimum 4.5:1 color contrast ratio throughout
- Full keyboard navigation support
- Screen reader compatible alerts via `role="alert"` and `aria-live`
- Focus management on modal/chat interactions

## Assumptions

- Stadium sections are pre-seeded in Firestore; fallback mock data is used if DB is empty
- Staff authentication is out of scope for this hackathon prototype
- Crowd density updates are crowdsourced and cached for 30 seconds to balance freshness vs. cost

## License

MIT © 2026 Utkarsh Singh Yadav
