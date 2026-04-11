const express = require('express');
const { body, validationResult } = require('express-validator');
const { broadcastMessage } = require('../services/realtimeService');
const { requireStaffKey } = require('../middleware/requireStaffKey');
const { MAX_ANNOUNCEMENT_LENGTH } = require('../config/constants');

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
    async (req, res, next) => {
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

module.exports = router;
