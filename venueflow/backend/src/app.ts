import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import 'dotenv/config';

import { logger } from './utils/logger';
import { REQUEST_BODY_LIMIT } from './config/constants';

const REQUIRED_ENV_VARS = ['GEMINI_API_KEY', 'FIREBASE_PROJECT_ID', 'FIREBASE_DATABASE_URL'];
const missingVars = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
if (missingVars.length > 0) {
    logger.warn('Missing environment variables; some features may not work', {
        missing: missingVars,
    });
}
if (!process.env.STAFF_API_KEY) {
    logger.warn('STAFF_API_KEY not set; staff broadcast endpoint will return 503');
}

import { readLimiter, writeLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { requestId } from './middleware/requestId';
import { requireJson } from './middleware/requireJson';

import crowdRoutes from './routes/crowd';
import queueRoutes from './routes/queue';
import geminiRoutes from './routes/gemini';
import staffRoutes from './routes/staff';

const app = express();

app.disable('x-powered-by');
app.use(requestId);

app.use(helmet({
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
}));

app.use(compression());

const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:5173'];

app.use(cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    allowedHeaders: ['Content-Type', 'X-Staff-Key', 'X-Request-Id'],
    methods: ['GET', 'POST', 'OPTIONS'],
    optionsSuccessStatus: 200,
}));

app.use(requireJson);

app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));

app.use(readLimiter);

app.use('/api/crowd', crowdRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/gemini', writeLimiter, geminiRoutes);
app.use('/api/staff', writeLimiter, staffRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;

if (require.main === module) {
    const PORT = Number(process.env.PORT) || 8080;
    app.listen(PORT, '0.0.0.0', () => {
        logger.info('VenueFlow server started', { host: '0.0.0.0', port: PORT });
    });
}
