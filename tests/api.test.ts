import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import { createApp } from '../server/app';
import { LocalStore } from '../server/store';
import { config } from '../server/config';

test('HTTP API rejects invalid links and cross-origin writes; absent providers never return a demo', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'unwatch-http-'));
  const live = config.live;
  config.live = false;
  const server = createApp(new LocalStore(dir)).listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const root = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const post = (body: unknown, origin = 'http://localhost:5173') =>
    fetch(`${root}/api/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify(body),
    });
  try {
    const publicConfig = await (await fetch(`${root}/api/config`)).json();
    assert.equal(publicConfig.liveReady, false);
    assert.equal('serpKey' in publicConfig, false);
    const invalid = await post({
      a: 'https://evil.test/watch?v=dQw4w9WgXcQ',
      b: 'https://youtu.be/M7lc1UVf-VE',
      mode: 'new',
    });
    assert.equal(invalid.status, 400);
    const duplicate = await post({
      a: 'https://youtu.be/M7lc1UVf-VE',
      b: 'https://youtu.be/M7lc1UVf-VE',
      mode: 'new',
    });
    assert.equal(duplicate.status, 400);
    const body = {
      a: 'https://youtu.be/dQw4w9WgXcQ',
      b: 'https://youtu.be/M7lc1UVf-VE',
      mode: 'new',
    };
    const noKeys = await post(body);
    assert.equal(noKeys.status, 503);
    const error = await noKeys.json();
    assert.equal(error.error.code, 'SETUP_REQUIRED');
    assert.equal('segments' in error, false);
    assert.equal((await post(body, 'https://other-site.example')).status, 403);
  } finally {
    config.live = live;
    await new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
    await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
});

test('HTTP API names the video when its captions are unavailable', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'unwatch-http-'));
  const originalFetch = globalThis.fetch;
  const originalConfig = {
    live: config.live,
    serpKey: config.serpKey,
    paperKey: config.paperKey,
    elevenKey: config.elevenKey,
  };
  config.live = true;
  config.serpKey = 'test-key';
  config.paperKey = 'test-key';
  config.elevenKey = '';
  globalThis.fetch = async (url) =>
    String(url).includes('qN1CzLdCq5g')
      ? Response.json({ error: 'No transcript' })
      : String(url).includes('/oembed')
        ? Response.json({ title: 'Second tutorial' })
        : Response.json({
            transcript: [{ start_ms: 0, end_ms: 10000, snippet: 'A caption.' }],
          });
  const server = createApp(new LocalStore(dir)).listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const root = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    const response = await originalFetch(`${root}/api/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
      body: JSON.stringify({
        a: 'https://youtu.be/qN1CzLdCq5g',
        b: 'https://youtu.be/H8Lyj2D_cWo',
        mode: 'new',
      }),
    });
    const body = await response.json();
    assert.equal(response.status, 422);
    assert.equal(body.error.code, 'NO_CAPTIONS');
    assert.match(body.error.message, /Tutorial A \(qN1CzLdCq5g\)/);
  } finally {
    globalThis.fetch = originalFetch;
    Object.assign(config, originalConfig);
    await new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
    await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
});
