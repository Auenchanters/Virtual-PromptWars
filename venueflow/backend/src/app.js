const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const { logger } = require('./utils/logger');
const { REQUEST_BODY_LIMIT } = require('./config/constants');

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

const { readLimiter, writeLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const { requestId } = require('./middleware/requestId');
const { requireJson } = require('./middleware/requireJson');

const crowdRoutes = require('./routes/crowd');
const queueRoutes = require('./routes/queue');
const geminiRoutes = require('./routes/gemini');
const staffRoutes = require('./routes/staff');

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
    origin: (origin, callback) => {
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

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, '0.0.0.0', () => {
        logger.info('VenueFlow server started', { host: '0.0.0.0', port: PORT });
    });
}
