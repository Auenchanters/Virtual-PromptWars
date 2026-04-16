import express, { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';
import { getCrowdData, getQueueData } from '../services/firestoreService';
import { generateCrowdForecast } from '../services/geminiService';
import { exportAnalyticsSnapshot } from '../services/storageService';
import { logAnalyticsEvent } from '../services/loggingService';
import { FORECAST_CACHE_TTL_SECONDS } from '../config/constants';

const router = express.Router();
export const forecastCache = new NodeCache({ stdTTL: FORECAST_CACHE_TTL_SECONDS });

/**
 * GET /api/crowd — live crowd density per section.
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await getCrowdData();
        res.setHeader('Cache-Control', 'public, max-age=30');
        res.status(200).json(data);
        // Fire-and-forget: export snapshot to Cloud Storage + Cloud Logging
        exportAnalyticsSnapshot(data).catch(() => {});
        logAnalyticsEvent('crowd_data_served', { sections: data.length });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/crowd/forecast — Gemini-generated 15-minute outlook with
 * alternative section recommendations. Cached for 60 seconds to keep
 * AI cost predictable.
 */
router.get('/forecast', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const cached = forecastCache.get('forecast');
        if (cached) {
            res.setHeader('Cache-Control', 'public, max-age=60');
            res.status(200).json({ forecast: cached });
            return;
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

export default router;
