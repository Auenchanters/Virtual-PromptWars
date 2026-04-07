const express = require('express');
const { body, validationResult } = require('express-validator');
const { chatWithGemini, generateItinerary } = require('../services/geminiService');
const router = express.Router();

/**
 * POST /api/gemini/chat
 * Answers attendee venue questions using Gemini API
 */
router.post('/chat', 
    [body('message').isString().notEmpty().withMessage('Message is required and must be a string')],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array()[0].msg, status: 400 });
            }

            const { message } = req.body;
            const reply = await chatWithGemini(message);
            res.status(200).json({ reply });
        } catch (err) {
            next(err);
        }
    }
);

/**
 * POST /api/gemini/itinerary
 * Generates personalized event itineraries
 */
router.post('/itinerary',
    [body('section').isString().notEmpty().withMessage('Section is required')],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array()[0].msg, status: 400 });
            }

            const { section } = req.body;
            const itinerary = await generateItinerary(section);
            res.status(200).json({ itinerary });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
