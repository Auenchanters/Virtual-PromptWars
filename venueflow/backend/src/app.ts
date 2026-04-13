import path from 'path';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import 'dotenv/config';
import './config/env';

import { logger } from './utils/logger';
import { REQUEST_BODY_LIMIT } from './config/constants';
import { readLimiter, writeLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { requestId } from './middleware/requestId';
import { requireJson } from './middleware/requireJson';

import crowdRoutes from './routes/crowd';
import queueRoutes from './routes/queue';
import geminiRoutes from './routes/gemini';
import staffRoutes from './routes/staff';

if (!process.env.STAFF_API_KEY) {
    logger.warn('STAFF_API_KEY not set; staff broadcast endpoint will return 503');
}

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(requestId);
app.use(compression());

/* ── Helmet security headers for API routes only ── */
const apiHelmet = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
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

const allowedOrigins: string[] = [
    'http://localhost:5173',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

const apiCors = cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (server-to-server, same-origin in some browsers)
        if (!origin) { callback(null, true); return; }
        // Allow explicitly listed origins
        if (allowedOrigins.includes(origin)) { callback(null, true); return; }
        // Allow same-origin requests (frontend served from same Cloud Run URL)
        if (process.env.K_SERVICE && origin.includes(process.env.K_SERVICE)) {
            callback(null, true); return;
        }
        callback(new Error('Not allowed by CORS'));
    },
    allowedHeaders: ['Content-Type', 'X-Staff-Key', 'X-Request-Id'],
    methods: ['GET', 'POST', 'OPTIONS'],
    optionsSuccessStatus: 200,
});

/* ── API routes (with Helmet, CORS, rate limiting, JSON parsing) ── */
app.use('/api', apiHelmet, apiCors, requireJson, express.json({ limit: REQUEST_BODY_LIMIT }), readLimiter);
app.use('/health', apiHelmet);

app.use('/api/crowd', crowdRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/gemini', writeLimiter, geminiRoutes);
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
