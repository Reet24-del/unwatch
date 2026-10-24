import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { MongoClient, type Collection } from 'mongodb';
import { config } from './config';
import { AppError } from './errors';

type RecordDoc = { _id: string; value: unknown; expiresAt?: Date };
type BudgetDoc = { _id: string; used: number };
export interface Store {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  remove(key: string): Promise<void>;
  list<T>(prefix: string): Promise<T[]>;
  reserve(key: string, amount: number, limit: number): Promise<void>;
}
function quota() {
  return new AppError(
    429,
    'BUDGET_EXHAUSTED',
    'The prototype allowance is used up. Saved sessions still work; new analysis is paused.',
  );
}

// One queue protects read-modify-write operations inside the single local server process.
// Public deployments use MongoDB's atomic conditional increments instead.
export class LocalStore implements Store {
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private directory: string) {}
  private async transaction<T>(fn: (data: Record<string, RecordDoc>) => T): Promise<T> {
    const operation = this.queue.then(async () => {
      await mkdir(this.directory, { recursive: true });
      const path = join(this.directory, 'store.json');
      let data: Record<string, RecordDoc> = {};
      try {
        data = JSON.parse(await readFile(path, 'utf8'));
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== 'ENOENT')
          throw new AppError(
            503,
            'STORAGE_ERROR',
            'Local storage could not be read. Analysis is paused to preserve the spending limit.',
          );
      }
      const result = fn(data);
      await writeFile(`${path}.tmp`, JSON.stringify(data), { mode: 0o600 });
      await rename(`${path}.tmp`, path);
      return result;
    });
    this.queue = operation.catch(() => {});
    return operation;
  }
  get<T>(key: string) {
    return this.transaction((data) => {
      const item = data[key];
      return item && (!item.expiresAt || new Date(item.expiresAt).getTime() > Date.now())
        ? (item.value as T)
        : null;
    });
  }
  async set(key: string, value: unknown, ttl?: number) {
    await this.transaction((data) => {
      data[key] = {
        _id: key,
        value,
        ...(ttl ? { expiresAt: new Date(Date.now() + ttl * 1000) } : {}),
      };
    });
  }
  async remove(key: string) {
    await this.transaction((data) => {
      delete data[key];
    });
  }
  list<T>(prefix: string) {
    return this.transaction((data) =>
      Object.entries(data)
        .filter(([k]) => k.startsWith(prefix))
        .map(([, v]) => v.value as T),
    );
  }
  async reserve(key: string, amount: number, limit: number) {
    await this.transaction((data) => {
      const k = `budget:${key}`;
      const used = Number(data[k]?.value || 0);
      if (!Number.isFinite(limit) || amount < 0 || used + amount > limit) throw quota();
      data[k] = { _id: k, value: used + amount };
    });
  }
}
class MongoStore implements Store {
  constructor(
    private records: Collection<RecordDoc>,
    private budgets: Collection<BudgetDoc>,
  ) {}
  async get<T>(key: string) {
    const item = await this.records.findOne({ _id: key });
    return item && (!item.expiresAt || item.expiresAt.getTime() > Date.now())
      ? (item.value as T)
      : null;
  }
  async set(key: string, value: unknown, ttl?: number) {
    await this.records.replaceOne(
      { _id: key },
      { value, ...(ttl ? { expiresAt: new Date(Date.now() + ttl * 1000) } : {}) },
      { upsert: true },
    );
  }
  async remove(key: string) {
    await this.records.deleteOne({ _id: key });
  }
  async list<T>(prefix: string) {
    const rows = await this.records
      .find({ _id: { $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` } })
      .limit(100)
      .toArray();
    return rows.map((row) => row.value as T);
  }
  async reserve(key: string, amount: number, limit: number) {
    if (!Number.isFinite(limit) || amount < 0) throw quota();
    try {
      await this.budgets.updateOne({ _id: key }, { $setOnInsert: { used: 0 } }, { upsert: true });
    } catch (e) {
      if ((e as { code?: number }).code !== 11000) throw e;
    }
    const updated = await this.budgets.findOneAndUpdate(
      { _id: key, used: { $lte: limit - amount } },
      { $inc: { used: amount } },
      { returnDocument: 'after' },
    );
    if (!updated) throw quota();
  }
}
export async function createStore(): Promise<Store> {
  if (!config.mongoUri) return new LocalStore(config.dataDir);
  const client = await new MongoClient(config.mongoUri, {
    serverSelectionTimeoutMS: 8000,
  }).connect();
  const db = client.db(config.mongoDb);
  const records = db.collection<RecordDoc>('records');
  await records.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  return new MongoStore(records, db.collection<BudgetDoc>('budgets'));
}
