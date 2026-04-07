const admin = require('firebase-admin');

// Only initialize if not already initialized (prevent hot-reload duplicate errors)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'demo@demo.com',
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----',
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

const db = admin.firestore();
const rtdb = admin.database();

module.exports = { admin, db, rtdb };
