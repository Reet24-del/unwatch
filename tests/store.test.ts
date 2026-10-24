import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { LocalStore } from '../server/store';

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
