import express, { Request, Response, NextFunction } from 'express';
import { broadcastMessage } from '../services/realtimeService';
import { requireStaffKey } from '../middleware/requireStaffKey';
import { broadcastSchema } from '../schemas/requests';

const router = express.Router();

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
                res.status(400).json({
                    error: parsed.error.issues[0]?.message ?? 'Invalid request.',
                    status: 400,
                    requestId: req.id,
                });
                return;
            }

            await broadcastMessage(parsed.data.announcement);
            res.status(201).json({ success: true, message: 'Broadcast sent successfully' });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
