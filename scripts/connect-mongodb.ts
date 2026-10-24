import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { MongoClient } from 'mongodb';

// Run with local analysis stopped, before enabling Mongo-backed live analysis.
// Import counters only: local sessions are not assigned to an Auth0 account.
const uri = process.env.MONGODB_URI;
if (!uri || uri.includes('<') || uri.includes('YOUR_PASSWORD')) {
  console.error('Set a complete MONGODB_URI in .env first. No credentials were logged.');
  process.exit(1);
}
let client: MongoClient | undefined;
try {
  const source = JSON.parse(await readFile(join(process.env.DATA_DIR || '.data', 'store.json'), 'utf8'));
  const counters = Object.entries(source)
    .filter(([key]) => key.startsWith('budget:'))
    .map(([key, doc]) => {
      const used = (doc as { value: unknown }).value;
      if (typeof used !== 'number' || !Number.isSafeInteger(used) || used < 0)
        throw new Error('INVALID_LOCAL_LEDGER');
      return { _id: key.slice('budget:'.length), used };
    });
  if (!counters.length) throw new Error('EMPTY_LOCAL_LEDGER');
  client = await new MongoClient(uri, { serverSelectionTimeoutMS: 10000 }).connect();
  const db = client.db(process.env.MONGODB_DATABASE || 'unwatch');
  await db.command({ ping: 1 });
  const budgets = db.collection<{ _id: string; used: number }>('budgets');
  for (const counter of counters) {
    // Re-running cannot lower or reset a reservation already in MongoDB.
    await budgets.updateOne({ _id: counter._id }, { $max: { used: counter.used } }, { upsert: true });
  }
  await db.collection('records').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  for (const counter of counters) {
    const saved = await budgets.findOne({ _id: counter._id });
    if (!saved || saved.used < counter.used) throw new Error('MIGRATION_CHECK_FAILED');
  }
  console.log(`MongoDB connected. Preserved ${counters.length} budget counters and verified the caption-expiry index.`);
} catch (error) {
  // Driver messages can contain hostnames and credentials. Emit only known labels.
  const label = error instanceof Error && ['INVALID_LOCAL_LEDGER', 'EMPTY_LOCAL_LEDGER', 'MIGRATION_CHECK_FAILED'].includes(error.message)
    ? error.message : 'CONNECTION_OR_MIGRATION_FAILED';
  console.error(`${label}: connection setup is incomplete; live analysis should remain paused.`);
  process.exitCode = 1;
} finally {
  await client?.close();
}
