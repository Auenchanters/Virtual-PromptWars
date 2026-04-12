import express, { Request, Response, NextFunction } from 'express';
import { getQueueData } from '../services/firestoreService';

const router = express.Router();

/**
 * GET /api/queue
 * Returns queue wait times for gates, concessions, and restrooms
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await getQueueData();
        res.setHeader('Cache-Control', 'public, max-age=30');
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
});

export default router;
