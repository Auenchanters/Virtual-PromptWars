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

app.use(helmet());
app.use(compression());
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(rateLimiter);

app.use('/api/crowd', crowdRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/staff', staffRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.use(errorHandler);

module.exports = app;

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.info(`VenueFlow server running on 0.0.0.0:${PORT}`);
});
