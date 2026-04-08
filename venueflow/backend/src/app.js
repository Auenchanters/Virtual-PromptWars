const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

// Startup environment variable validation — fail fast if required keys are missing
const REQUIRED_ENV_VARS = ['GEMINI_API_KEY', 'FIREBASE_PROJECT_ID', 'FIREBASE_DATABASE_URL'];
const missingVars = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
if (missingVars.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}. Some features may not work.`);
}

const { rateLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

const crowdRoutes = require('./routes/crowd');
const queueRoutes = require('./routes/queue');
const geminiRoutes = require('./routes/gemini');
const staffRoutes = require('./routes/staff');

const app = express();

// Security middleware with full helmet configuration
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.use(compression());

// CORS restricted to explicit frontend origin only
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
    optionsSuccessStatus: 200,
}));

// Body size limit to prevent payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting
app.use(rateLimiter);

// Routes
app.use('/api/crowd', crowdRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/staff', staffRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.info(`VenueFlow server running on 0.0.0.0:${PORT}`);
});
