import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { broadcastMessage } from '../services/realtimeService';
import { requireStaffKey } from '../middleware/requireStaffKey';
import { MAX_ANNOUNCEMENT_LENGTH } from '../config/constants';

const router = express.Router();

/**
 * POST /api/staff/broadcast — gated by `X-Staff-Key` header, pushes
 * an announcement to every connected attendee via Firebase RTDB.
 */
router.post(
    '/broadcast',
    requireStaffKey,
    [
        body('announcement')
            .isString().withMessage('Announcement must be a string')
            .bail()
            .trim()
            .notEmpty().withMessage('Announcement text is required')
            .isLength({ max: MAX_ANNOUNCEMENT_LENGTH })
            .withMessage(`Announcement must be at most ${MAX_ANNOUNCEMENT_LENGTH} characters`)
            .escape(),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: errors.array()[0].msg,
                    status: 400,
                    requestId: req.id,
                });
            }

            await broadcastMessage(req.body.announcement);
            res.status(201).json({ success: true, message: 'Broadcast sent successfully' });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
