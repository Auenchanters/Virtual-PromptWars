import express, { Request, Response, NextFunction } from 'express';
import { getWalkingTime } from '../services/mapsService';

const router = express.Router();

const MAX_LOCATION_LENGTH = 128;

function isValidLocation(value: unknown): value is string {
    return (
        typeof value === 'string' &&
        value.trim().length > 0 &&
        value.length <= MAX_LOCATION_LENGTH
    );
}

/**
 * GET /api/maps/distance?origin=Gate+A&destination=Section+112
 * Returns walking distance and duration between two stadium locations
 * via the server-side Google Maps Distance Matrix API.
 */
router.get('/distance', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { origin, destination } = req.query;

        if (!isValidLocation(origin) || !isValidLocation(destination)) {
            res.status(400).json({
                error: 'origin and destination are required query parameters (<= 128 chars).',
            });
            return;
        }

        const result = await getWalkingTime(origin, destination);
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

export default router;
