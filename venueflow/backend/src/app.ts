import path from 'path';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import 'dotenv/config';
import './config/env';

import { env } from './config/env';
import { logger } from './utils/logger';
import { REQUEST_BODY_LIMIT, REQUEST_TIMEOUT_MS } from './config/constants';
import { logAnalyticsEvent } from './services/loggingService';
import { readLimiter, writeLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { requestId } from './middleware/requestId';
import { requireJson } from './middleware/requireJson';
import { requestTimeout } from './middleware/timeout';

import crowdRoutes from './routes/crowd';
import queueRoutes from './routes/queue';
import geminiRoutes from './routes/gemini';
import staffRoutes from './routes/staff';

if (!process.env.STAFF_API_KEY) {
    logger.warn('STAFF_API_KEY not set; staff broadcast endpoint will return 503');
}
if (env.FRONTEND_URL === 'http://localhost:5173' && process.env.NODE_ENV === 'production') {
    throw new Error('FRONTEND_URL must be explicitly set in production (cannot use localhost default)');
}

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(requestId);
app.use(requestTimeout(REQUEST_TIMEOUT_MS));
app.use(compression());

/* ── Request logging — structured events for Cloud Logging ── */
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        logAnalyticsEvent('http_request', {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            duration: Date.now() - start,
        });
    });
    next();
});

/* ── Helmet security headers for API routes only ── */
const apiHelmet = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            // Tailwind builds are inlined at compile time — remove unsafe-inline if using a custom CSS build
            styleSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            frameAncestors: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' },
});

const allowedOrigins: string[] = [env.FRONTEND_URL];

const apiCors = cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // In production, require an Origin header to prevent scraping of unauthenticated
        // read endpoints. In development, allow no-origin requests for curl/Postman.
        if (!origin) {
            if (process.env.NODE_ENV === 'production') {
                callback(new Error('Origin header required in production'));
                return;
            }
            callback(null, true);
            return;
        }
        // Allow explicitly listed origins
        if (allowedOrigins.includes(origin)) { callback(null, true); return; }
        // Allow same-origin requests (frontend served from same Cloud Run URL)
        if (process.env.K_SERVICE && origin.includes(process.env.K_SERVICE)) {
            callback(null, true); return;
        }
        callback(new Error('Not allowed by CORS'));
    },
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Staff-Key', 'X-Request-Id'],
    methods: ['GET', 'POST', 'OPTIONS'],
    optionsSuccessStatus: 200,
});

/* ── API routes (with Helmet, CORS, rate limiting, JSON parsing) ── */
app.use('/api', apiHelmet, apiCors, requireJson, express.json({ limit: REQUEST_BODY_LIMIT }), readLimiter);
app.use('/health', apiHelmet);

app.use('/api/crowd', crowdRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/staff', writeLimiter, staffRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

/* ── Serve frontend static files (no CSP — frontend loads Google Maps, Firebase) ── */
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

app.use(errorHandler);

export default app;
