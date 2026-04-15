import { z } from 'zod';

export const CrowdSectionSchema = z.object({
    id: z.string().min(1),
    section: z.string().min(1),
    density: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

export const QueueItemSchema = z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    waitTimeMinutes: z.number().nonnegative().finite(),
});

export type CrowdSectionDoc = z.infer<typeof CrowdSectionSchema>;
export type QueueItemDoc = z.infer<typeof QueueItemSchema>;
