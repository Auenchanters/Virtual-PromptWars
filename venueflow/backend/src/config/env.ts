import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
    GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
    PORT: z.coerce.number().default(8080),
    /** Optional — only required when Firebase/GCP services are enabled; dev can run without. */
    FIREBASE_PROJECT_ID: z.string().optional(),
    /** Optional — only required when connecting to Firebase Realtime Database. */
    FIREBASE_DATABASE_URL: z.string().optional(),
    /** Optional — service account email for Firebase Admin SDK; not needed for local dev. */
    FIREBASE_CLIENT_EMAIL: z.string().optional(),
    /** Optional — service account private key for Firebase Admin SDK; not needed for local dev. */
    FIREBASE_PRIVATE_KEY: z.string().optional(),
    /** Optional — API key for the staff broadcast endpoint; if unset the endpoint returns 503. */
    STAFF_API_KEY: z.string().optional(),
    /** Base URL of the frontend for CORS. Defaults to local dev server so dev works out of the box. */
    FRONTEND_URL: z.string().min(1).default('http://localhost:5173'),
    /** Runtime environment — used to gate stack traces and enforce production-only checks. */
    NODE_ENV: z.string().default('development'),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
