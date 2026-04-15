import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { broadcastMessage } from '../services/realtimeService';
import { requireStaffKey } from '../middleware/requireStaffKey';
import { sanitize } from '../utils/sanitize';
import { MAX_ANNOUNCEMENT_LENGTH } from '../config/constants';

const router = express.Router();

const broadcastSchema = z.object({
    announcement: z
        .string({ invalid_type_error: 'Announcement must be a string' })
        .trim()
        .min(1, 'Announcement text is required')
        .max(MAX_ANNOUNCEMENT_LENGTH, `Announcement must be at most ${MAX_ANNOUNCEMENT_LENGTH} characters`)
        .transform(sanitize),
});

/**
 * POST /api/staff/broadcast — gated by `X-Staff-Key` header, pushes
 * an announcement to every connected attendee via Firebase RTDB.
 */
router.post(
    '/broadcast',
    requireStaffKey,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = broadcastSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    error: parsed.error.issues[0]?.message ?? 'Invalid request.',
                    status: 400,
                    requestId: req.id,
                });
            }

            await broadcastMessage(parsed.data.announcement);
            res.status(201).json({ success: true, message: 'Broadcast sent successfully' });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
