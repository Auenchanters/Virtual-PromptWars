# PromptWars Hackathon - Project Context

## 1. Event & Challenge Context

- **Event:** Virtual PromptWars Hackathon
- **Organizers:** Hack2Skill × Google Cloud
- **Challenge Theme:** Physical Event Experience
- **Development Constraint:** Solutions must be built through prompting and coding (using Google Antigravity/AI tools).
- **Submission Requirements:**
  - Public GitHub repository link.
  - Keep all work within a single branch (`main`).
  - Complete project code inside the repository.
  - A detailed README explaining: chosen vertical, approach and logic, how the solution works, and assumptions made.
  - A live deployed demo.

## 2. Project Overview: VenueFlow

**VenueFlow** is an AI-powered smart stadium experience platform designed to solve the three core challenges of large-scale sporting events: crowd movement, waiting times, and real-time coordination.

### Problem → Solution Mapping

| Challenge | VenueFlow Feature | How It Works |
|-----------|------------------|--------------|
| **Crowd Movement** | Live Crowd Heatmap | Real-time color-coded density map (LOW/MEDIUM/HIGH) on Google Maps so attendees avoid congested zones. |
| **Waiting Times** | Smart Queue Estimator | Live wait times for gates, concessions, and restrooms updated via Firebase. |
| **Real-Time Coordination** | Staff Broadcast Feed | Staff push live alerts via Firebase Realtime Database. |
| **Personalization & AI** | Gemini Venue Assistant | Gemini 2.0 Flash acts as a chatbot answering venue questions and generates personalized itineraries based on seating sections. |

## 3. Tech Stack & Infrastructure

- **Backend:** Node.js 18, Express.js, TypeScript (Strict Mode)
- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **DevOps:** Docker, Google Cloud Run, Cloud Build
- **Google Services Integrated (Maximized Score):**
  1. **Gemini API (gemini-2.0-flash):** Chatbot, crowd summaries, forecasting, and itinerary generation.
  2. **Google Maps JavaScript API:** Stadium map with crowd density overlays.
  3. **Firebase Firestore:** Crowd density and queue wait time data.
  4. **Firebase Realtime Database:** Live staff broadcast messages.
  5. **Google Cloud Run:** Containerized, auto-scaling backend deployment.

## 4. Evaluation Rubric & Current Standing

*Initial submission scored 94.96%. Through rigorous architectural upgrades, the codebase is currently tracking at an estimated 98.5% - 99%. The target is the current #1 score of 99.97%.*

### I. Code Quality

- **Focus:** Structure, readability, maintainability.
- **Current State:** 100% strict TypeScript backend (`src/` entirely converted). Uses proper ES Modules (`import`/`export`), structured layers (`routes`, `services`, `middleware`), full JSDoc comments, and unified ESLint/Prettier formatting.

### II. Security

- **Focus:** Safe and responsible implementation.
- **Current State:** Defense-in-depth approach.
  - HTTP headers hardened via `helmet`.
  - Rate limiting via `express-rate-limit` (split by read/write APIs).
  - Staff endpoint secured via `crypto.timingSafeEqual`.
  - **Target State (for 99.97%):** Moving from `express-validator` to schema-first `zod` validation for both incoming requests AND `process.env` validation at startup. Implementation of an `xss` sanitization utility for Gemini/Broadcast inputs.

### III. Efficiency

- **Focus:** Optimal use of resources.
- **Current State:** Perfect score. Uses `node-cache` to cache Firestore reads (TTL 30s) and Gemini forecasts (TTL 60s) to minimize DB reads and AI token costs. Uses HTTP `compression`.

### IV. Testing

- **Focus:** Validation of functionality.
- **Current State:** 80% coverage threshold enforced. Unit tests covering routes, middleware, and services via `jest` and `ts-jest`.
- **Target State (for 99.97%):** Split `app.ts` from `server.ts` to allow raw Express app testing. Implement full E2E HTTP boundary tests using `supertest`. Implement strategic coverage thresholds (85% global, 95% on critical paths like routes and utils).

### V. Accessibility

- **Focus:** Inclusive and usable design.
- **Current State:** WCAG 2.1 AA compliant. Semantic HTML5 landmarks, strict ARIA roles (`role="dialog"`, `aria-live="polite"`), skip-to-content links, and custom `useFocusTrap` hooks for modals.
- **Target State (for 99.97%):** Moving from manual ARIA assertions to programmatic WCAG compliance loops using `jest-axe` across all page-level React components, enforced by `eslint-plugin-jsx-a11y`.

### VI. Google Services

- **Focus:** Meaningful integration of Google Services.
- **Current State:** Perfect score. 5 distinct services utilized cohesively.

## 5. The Final Strategy to 99.97%

To bridge the final 1% gap, the project is moving from "a well-built hackathon app" to "enterprise-grade microservice architecture" by focusing on high-signal tooling:

1. **Zod Environment Validation:** Failing fast if deployment config is missing.
2. **XSS Whitelisting:** Dedicated security utilities parsing AI inputs.
3. **jest-axe CI Loops:** Programmatically guaranteeing zero WCAG violations in frontend components.
4. **Supertest E2E:** Testing the actual HTTP boundary, not just mocking internal services.
