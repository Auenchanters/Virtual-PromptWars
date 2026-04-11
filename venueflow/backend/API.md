# VenueFlow Backend API

Base URL (local): `http://localhost:8080`
Base URL (prod):  `https://venueflow-backend-608358746679.asia-south1.run.app`

All responses are JSON. Every response includes an `X-Request-Id` header for
log correlation. Error responses follow the shape
`{ "error": string, "status": number, "requestId": string }`.

## Health

### `GET /health`
Liveness probe used by Cloud Run.

| Status | Body |
| ------ | ---- |
| 200    | `{ "status": "healthy", "timestamp": "<ISO date>" }` |

## Crowd

### `GET /api/crowd`
Current crowd density per stadium section. Cached for 30 seconds server-side.

| Status | Body |
| ------ | ---- |
| 200    | `[{ "section": "101", "density": "LOW" \| "MEDIUM" \| "HIGH" }, ...]` |

### `GET /api/crowd/forecast`
Gemini-generated 15-minute crowd outlook with alternative section
recommendations. Cached for 60 seconds.

| Status | Body |
| ------ | ---- |
| 200    | `{ "forecast": "string" }` |

## Queues

### `GET /api/queue`
Live wait times for gates, concessions, and restrooms.

| Status | Body |
| ------ | ---- |
| 200    | `[{ "id": "gate-1", "type": "gate", "waitTimeMinutes": 15 }, ...]` |

## Gemini AI

Both endpoints require `Content-Type: application/json` and are subject to the
stricter write-rate limiter (20 requests / 15 minutes per IP).

### `POST /api/gemini/chat`
Conversational venue assistance.

Request:
```json
{ "message": "Where is gate 4?" }
```
Constraints: `message` is a non-empty string, max 500 characters.

| Status | Body |
| ------ | ---- |
| 200    | `{ "reply": "string" }` |
| 400    | Validation error |
| 415    | Non-JSON content type |
| 429    | Rate limit exceeded |

### `POST /api/gemini/itinerary`
Personalized itinerary tailored to current crowd density.

Request:
```json
{ "section": "112" }
```
Constraints: `section` is a non-empty string, max 16 characters.

| Status | Body |
| ------ | ---- |
| 200    | `{ "itinerary": "string" }` |
| 400    | Validation error |

## Staff

### `POST /api/staff/broadcast`
Push a live announcement to every connected attendee client (Firebase RTDB).

Headers:
- `Content-Type: application/json`
- `X-Staff-Key: <STAFF_API_KEY>` — **required**; compared in constant time.

Request:
```json
{ "announcement": "Gate 3 is temporarily closed" }
```
Constraints: `announcement` is a non-empty string, max 1000 characters, HTML-escaped server-side.

| Status | Body |
| ------ | ---- |
| 201    | `{ "success": true, "message": "Broadcast sent successfully" }` |
| 400    | Validation error |
| 401    | Missing or invalid staff key |
| 415    | Non-JSON content type |
| 429    | Rate limit exceeded |
| 503    | Staff key not configured on server |
