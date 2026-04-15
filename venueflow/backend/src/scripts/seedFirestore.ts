import 'dotenv/config';
import { db } from '../config/firebaseAdmin';

const CROWD_SEED = [
    { section: '101', density: 'HIGH' },
    { section: '102', density: 'MEDIUM' },
    { section: '103', density: 'LOW' },
    { section: '104', density: 'LOW' },
    { section: '105', density: 'MEDIUM' },
    { section: '106', density: 'HIGH' },
    { section: '107', density: 'LOW' },
    { section: '108', density: 'MEDIUM' },
    { section: '109', density: 'LOW' },
    { section: '110', density: 'HIGH' },
    { section: '111', density: 'MEDIUM' },
    { section: '112', density: 'LOW' },
];

const QUEUE_SEED = [
    { type: 'gate', waitTimeMinutes: 12 },
    { type: 'gate', waitTimeMinutes: 8 },
    { type: 'gate', waitTimeMinutes: 15 },
    { type: 'gate', waitTimeMinutes: 5 },
    { type: 'concessions', waitTimeMinutes: 7 },
    { type: 'concessions', waitTimeMinutes: 3 },
    { type: 'concessions', waitTimeMinutes: 10 },
    { type: 'restroom', waitTimeMinutes: 2 },
    { type: 'restroom', waitTimeMinutes: 4 },
    { type: 'restroom', waitTimeMinutes: 1 },
];

async function clearCollection(name: string) {
    const snapshot = await db.collection(name).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.info(`Cleared ${snapshot.size} docs from "${name}"`);
}

async function seed() {
    console.info('Seeding Firestore with realistic stadium data...\n');

    await clearCollection('crowd');
    await clearCollection('queues');

    const crowdBatch = db.batch();
    for (const data of CROWD_SEED) {
        const ref = db.collection('crowd').doc(`section-${data.section}`);
        crowdBatch.set(ref, data);
    }
    await crowdBatch.commit();
    console.info(`Seeded ${CROWD_SEED.length} crowd sections`);

    const queueBatch = db.batch();
    QUEUE_SEED.forEach((data, i) => {
        const ref = db.collection('queues').doc(`${data.type}-${i + 1}`);
        queueBatch.set(ref, data);
    });
    await queueBatch.commit();
    console.info(`Seeded ${QUEUE_SEED.length} queue entries`);

    console.info('\nSeed complete.');
    process.exit(0);
}

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
