const express = require('express');
const { getCrowdData } = require('../services/firestoreService');
const router = express.Router();

/**
 * GET /api/crowd
 * Returns an array of section data based on current crowd density
 */
router.get('/', async (req, res, next) => {
    try {
        const data = await getCrowdData();
        res.setHeader('Cache-Control', 'public, max-age=30');
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
