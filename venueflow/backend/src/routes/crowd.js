const express = require('express');
const NodeCache = require('node-cache');
const { getCrowdData, getQueueData } = require('../services/firestoreService');
const { generateCrowdForecast } = require('../services/geminiService');
const { FORECAST_CACHE_TTL_SECONDS } = require('../config/constants');

const router = express.Router();
const forecastCache = new NodeCache({ stdTTL: FORECAST_CACHE_TTL_SECONDS });

/**
 * GET /api/crowd — live crowd density per section.
 */
router.get('/', async (req, res, next) => {
    try {
        const data = await getCrowdData();
        res.setHeader('Cache-Control', 'public, max-age=30');
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/crowd/forecast — Gemini-generated 15-minute outlook with
 * alternative section recommendations. Cached for 60 seconds to keep
 * AI cost predictable.
 */
router.get('/forecast', async (req, res, next) => {
    try {
        const cached = forecastCache.get('forecast');
        if (cached) {
            res.setHeader('Cache-Control', 'public, max-age=60');
            return res.status(200).json({ forecast: cached });
        }

        const [crowd, queues] = await Promise.all([
            getCrowdData(),
            getQueueData(),
        ]);
        const forecast = await generateCrowdForecast(crowd, queues);
        forecastCache.set('forecast', forecast);
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.status(200).json({ forecast });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
