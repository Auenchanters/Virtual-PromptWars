import admin from 'firebase-admin';
import { logger } from '../utils/logger';

/**
 * Initializes Firebase Admin SDK.
 * If FIREBASE_PRIVATE_KEY is set, attempts service account credentials.
 * Falls back to Application Default Credentials (ADC) on failure or
 * when no private key is provided. ADC works automatically on Cloud Run.
 */
if (!admin.apps.length) {
    const projectId = (process.env.FIREBASE_PROJECT_ID || 'virtual-promptwars').trim();
    const databaseURL = process.env.FIREBASE_DATABASE_URL?.trim();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    const rawKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
    const hasPrivateKey = rawKey && rawKey.length > 0;

    let initialized = false;

    if (hasPrivateKey) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: rawKey.replace(/\\n/g, '\n'),
                }),
                databaseURL,
            });
            initialized = true;
        } catch (err: unknown) {
            logger.warn('Service account credential failed, falling back to ADC', {
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }

    if (!initialized) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId,
            databaseURL,
        });
    }
}

const db = admin.firestore();
const rtdb = admin.database();

export { admin, db, rtdb };
