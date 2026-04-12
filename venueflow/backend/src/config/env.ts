import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
    GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
    PORT: z.coerce.number().default(8080),
    FIREBASE_PROJECT_ID: z.string().optional(),
    FIREBASE_DATABASE_URL: z.string().optional(),
    FIREBASE_CLIENT_EMAIL: z.string().optional(),
    FIREBASE_PRIVATE_KEY: z.string().optional(),
    STAFF_API_KEY: z.string().optional(),
    FRONTEND_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
