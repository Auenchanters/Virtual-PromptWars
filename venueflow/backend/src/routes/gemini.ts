import express, { Request, Response, NextFunction } from 'express';
import { chatWithGemini, generateItinerary } from '../services/geminiService';
import { getCrowdData } from '../services/firestoreService';
import { chatSchema, itinerarySchema } from '../schemas/requests';

const router = express.Router();

/**
 * POST /api/gemini/chat — AI venue assistant.
 */
router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
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
router.post('/itinerary', async (req: Request, res: Response, next: NextFunction) => {
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

export default router;
