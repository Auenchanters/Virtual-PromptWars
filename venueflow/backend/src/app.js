const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const { rateLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

const crowdRoutes = require('./routes/crowd');
const queueRoutes = require('./routes/queue');
const geminiRoutes = require('./routes/gemini');
const staffRoutes = require('./routes/staff');

const app = express();

// Apply Security and Performance Middleware
app.use(helmet());
app.use(compression());
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Apply rate limiter to all routes
app.use(rateLimiter);

// Routes
app.use('/api/crowd', crowdRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/staff', staffRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.info(`Server is running on port ${PORT}`);
    });
}
