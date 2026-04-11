const express = require('express');
const { body, validationResult } = require('express-validator');
const { chatWithGemini, generateItinerary } = require('../services/geminiService');
const { getCrowdData } = require('../services/firestoreService');
const {
    MAX_MESSAGE_LENGTH,
    MAX_SECTION_LENGTH,
} = require('../config/constants');

const router = express.Router();

function sendValidationError(req, res, errors) {
    return res.status(400).json({
        error: errors.array()[0].msg,
        status: 400,
        requestId: req.id,
    });
}

/**
 * POST /api/gemini/chat — AI venue assistant.
 */
router.post(
    '/chat',
    [
        body('message')
            .isString().withMessage('Message must be a string')
            .bail()
            .trim()
            .notEmpty().withMessage('Message is required')
            .isLength({ max: MAX_MESSAGE_LENGTH })
            .withMessage(`Message must be at most ${MAX_MESSAGE_LENGTH} characters`),
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return sendValidationError(req, res, errors);

            const reply = await chatWithGemini(req.body.message);
            res.status(200).json({ reply });
        } catch (err) {
            next(err);
        }
    }
);

/**
 * POST /api/gemini/itinerary — crowd-aware personalized itinerary.
 */
router.post(
    '/itinerary',
    [
        body('section')
            .isString().withMessage('Section must be a string')
            .bail()
            .trim()
            .notEmpty().withMessage('Section is required')
            .isLength({ max: MAX_SECTION_LENGTH })
            .withMessage(`Section must be at most ${MAX_SECTION_LENGTH} characters`),
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return sendValidationError(req, res, errors);

            const crowd = await getCrowdData().catch(() => []);
            const itinerary = await generateItinerary(req.body.section, crowd);
            res.status(200).json({ itinerary });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
