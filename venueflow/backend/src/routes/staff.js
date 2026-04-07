const express = require('express');
const { body, validationResult } = require('express-validator');
const { broadcastMessage } = require('../services/realtimeService');
const router = express.Router();

/**
 * POST /api/staff/broadcast
 * Endpoint for staff to push live announcements via Firebase Realtime Database
 */
router.post('/broadcast',
    [body('announcement').isString().notEmpty().withMessage('Announcement text is required')],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array()[0].msg, status: 400 });
            }

            const { announcement } = req.body;
            await broadcastMessage(announcement);
            res.status(201).json({ success: true, message: 'Broadcast sent successfully' });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
