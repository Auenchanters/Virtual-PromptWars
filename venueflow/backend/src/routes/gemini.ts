import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { chatWithGemini, generateItinerary } from '../services/geminiService';
import { getCrowdData } from '../services/firestoreService';
import { sanitize } from '../utils/sanitize';
import {
    MAX_MESSAGE_LENGTH,
    MAX_SECTION_LENGTH,
} from '../config/constants';

const router = express.Router();

const chatSchema = z.object({
    message: z
        .string({ invalid_type_error: 'Message must be a string' })
        .trim()
        .min(1, 'Message is required')
        .max(MAX_MESSAGE_LENGTH, `Message must be at most ${MAX_MESSAGE_LENGTH} characters`)
        .transform(sanitize),
});

const itinerarySchema = z.object({
    section: z
        .string({ invalid_type_error: 'Section must be a string' })
        .trim()
        .min(1, 'Section is required')
        .max(MAX_SECTION_LENGTH, `Section must be at most ${MAX_SECTION_LENGTH} characters`)
        .transform(sanitize),
});

/**
 * POST /api/gemini/chat — AI venue assistant.
 */
router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = chatSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: parsed.error.issues[0].message,
                status: 400,
                requestId: req.id,
            });
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
            return res.status(400).json({
                error: parsed.error.issues[0].message,
                status: 400,
                requestId: req.id,
            });
        }

        const crowd = await getCrowdData().catch(() => []);
        const itinerary = await generateItinerary(parsed.data.section, crowd);
        res.status(200).json({ itinerary });
    } catch (err) {
        next(err);
    }
});

export default router;
