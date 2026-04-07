const express = require('express');
const { getQueueData } = require('../services/firestoreService');
const router = express.Router();

/**
 * GET /api/queue
 * Returns queue wait times for gates, concessions, and restrooms
 */
router.get('/', async (req, res, next) => {
    try {
        const data = await getQueueData();
        res.setHeader('Cache-Control', 'public, max-age=30');
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
