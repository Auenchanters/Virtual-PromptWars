import { z } from 'zod';
import { sanitize } from '../utils/sanitize';
import {
    MAX_MESSAGE_LENGTH,
    MAX_SECTION_LENGTH,
    MAX_ANNOUNCEMENT_LENGTH,
} from '../config/constants';

/**
 * Request validation schemas for all API endpoints.
 * Centralised here to eliminate duplication across route files and
 * keep the validation layer separate from routing logic.
 */

export const chatSchema = z.object({
    message: z
        .string({ invalid_type_error: 'Message must be a string' })
        .trim()
        .min(1, 'Message is required')
        .max(MAX_MESSAGE_LENGTH, `Message must be at most ${MAX_MESSAGE_LENGTH} characters`)
        .transform(sanitize),
});

export const itinerarySchema = z.object({
    section: z
        .string({ invalid_type_error: 'Section must be a string' })
        .trim()
        .min(1, 'Section is required')
        .max(MAX_SECTION_LENGTH, `Section must be at most ${MAX_SECTION_LENGTH} characters`)
        .transform(sanitize),
});

export const broadcastSchema = z.object({
    announcement: z
        .string({ invalid_type_error: 'Announcement must be a string' })
        .trim()
        .min(1, 'Announcement text is required')
        .max(MAX_ANNOUNCEMENT_LENGTH, `Announcement must be at most ${MAX_ANNOUNCEMENT_LENGTH} characters`)
        .transform(sanitize),
});
