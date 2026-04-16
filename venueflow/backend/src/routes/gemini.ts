import express, { Request, Response, NextFunction } from 'express';
import { chatWithGemini, generateItinerary, generateCrowdForecast, generateCrowdSummary } from '../services/geminiService';
import { getCrowdData, getQueueData } from '../services/firestoreService';
import { exportAnalyticsSnapshot } from '../services/storageService';
import { chatSchema, itinerarySchema } from '../schemas/requests';
import { writeLimiter } from '../middleware/rateLimiter';

const router = express.Router();

/**
 * POST /api/gemini/chat — AI venue assistant.
 */
router.post('/chat', writeLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = chatSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                error: parsed.error.issues[0]?.message ?? 'Invalid request.',
                status: 400,
                requestId: req.id,
            });
            return;
        }

        const reply = await chatWithGemini(parsed.data.message);
        res.status(200).json({ reply });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/gemini/itinerary — crowd-aware personalized itinerary.
 */
router.post('/itinerary', writeLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = itinerarySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                error: parsed.error.issues[0]?.message ?? 'Invalid request.',
                status: 400,
                requestId: req.id,
            });
            return;
        }

        const crowd = await getCrowdData().catch(() => []);
        const itinerary = await generateItinerary(parsed.data.section, crowd);
        res.status(200).json({ itinerary });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/gemini/summary — AI-generated crowd density summary.
 */
router.get('/summary', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const crowd = await getCrowdData();
        const summary = await generateCrowdSummary(crowd);
        // Fire-and-forget: export snapshot to Cloud Storage for analytics
        exportAnalyticsSnapshot(crowd).catch(() => {});
        res.status(200).json({ summary });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/gemini/forecast — AI-generated 15-minute crowd forecast.
 */
router.get('/forecast', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const [crowd, queues] = await Promise.all([
            getCrowdData(),
            getQueueData(),
        ]);
        const forecast = await generateCrowdForecast(crowd, queues);
        res.status(200).json({ forecast });
    } catch (err) {
        next(err);
    }
});

export default router;
