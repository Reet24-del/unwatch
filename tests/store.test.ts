import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { LocalStore } from '../server/store';
import { AppError } from '../server/errors';

test('exhausted allowances identify the affected service without changing the spending limits', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'unwatch-allowance-'));
  try {
    const store = new LocalStore(dir);
    for (const [key, expected] of [
      ['elevenlabs-attempts', /audio-transcription attempt limit/],
      ['serp-total', /caption lookup allowance/],
      ['paper-cents', /model-analysis allowance/],
    ] as const) {
      await assert.rejects(store.reserve(key, 1, 0), (error: unknown) => {
        assert.ok(error instanceof AppError);
        assert.equal(error.code, 'BUDGET_EXHAUSTED');
        assert.match(error.message, expected);
        return true;
      });
      await assert.rejects(new LocalStore(dir).reserve(key, 1, 0));
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('concurrent reservations cannot exceed budget and survive restart', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'unwatch-test-'));
  try {
    const store = new LocalStore(dir);
    const outcomes = await Promise.allSettled(
      Array.from({ length: 20 }, () => store.reserve('budget', 1, 5)),
    );
    assert.equal(outcomes.filter((r) => r.status === 'fulfilled').length, 5);
    await assert.rejects(new LocalStore(dir).reserve('budget', 1, 5));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test('owner-prefixed records are isolated; corruption fails closed', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'unwatch-test-'));
  try {
    const store = new LocalStore(dir);
    await store.set('session:alice:one', { title: 'private' });
    await store.set('session:bob:one', { title: 'different' });
    assert.deepEqual(await store.list('session:alice:'), [{ title: 'private' }]);
    await store.remove('session:alice:one');
    assert.equal(await store.get('session:alice:one'), null);
    assert.deepEqual(await store.get('session:bob:one'), { title: 'different' });
    await writeFile(join(dir, 'store.json'), 'broken');
    await assert.rejects(store.reserve('budget', 1, 100));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
