import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { LocalStore } from '../server/store';
import { analyze, fetchTranscript } from '../server/providers';
import { comparisonWorkflow } from '../server/workflow';
import { config } from '../server/config';

test('retrieves once and serves the same transcript from cache', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'unwatch-api-'));
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (url) => {
    calls++;
    if (String(url).includes('/oembed')) return Response.json({ title: 'A real tutorial title' });
    return Response.json({
      transcript: [{ start_ms: 0, end_ms: 10000, snippet: 'Example captions.' }],
    });
  };
  try {
    const store = new LocalStore(dir);
    const first = await fetchTranscript('dQw4w9WgXcQ', store);
    assert.equal(first.cached, false);
    assert.equal(first.video.title, 'A real tutorial title');
    assert.equal((await fetchTranscript('dQw4w9WgXcQ', store)).cached, true);
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = original;
    await rm(dir, { recursive: true, force: true });
  }
});
test('does not create placeholder captions when a source is unavailable', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'unwatch-api-'));
  const original = globalThis.fetch;
  const originalElevenKey = config.elevenKey;
  config.elevenKey = '';
  globalThis.fetch = async () => Response.json({ error: 'Unavailable' });
  try {
    await assert.rejects(
      fetchTranscript('dQw4w9WgXcQ', new LocalStore(dir)),
      /Captions are unavailable/,
    );
  } finally {
    globalThis.fetch = original;
    config.elevenKey = originalElevenKey;
    await rm(dir, { recursive: true, force: true });
  }
});
test('uses ElevenLabs source_url when YouTube captions are absent, then caches the transcript', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'unwatch-scribe-'));
  const original = globalThis.fetch;
  const originalElevenKey = config.elevenKey;
  config.elevenKey = 'test-key';
  let scribeCalls = 0;
  globalThis.fetch = async (url, init) => {
    if (String(url).includes('serpapi')) return Response.json({ error: 'No transcript' });
    if (String(url).includes('elevenlabs')) {
      scribeCalls++;
      const form = init?.body as FormData;
      assert.equal(form.get('source_url'), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      assert.equal(form.get('model_id'), 'scribe_v2');
      return Response.json({
        language_code: 'hin',
        words: [
          { start: 0, end: 0.5, text: 'Docker', type: 'word' },
          { text: ' ', type: 'spacing' },
          { start: 0.5, end: 1, text: 'containers', type: 'word' },
        ],
      });
    }
    return Response.json({ title: 'Docker lesson' });
  };
  try {
    const store = new LocalStore(dir);
    const first = await fetchTranscript('dQw4w9WgXcQ', store);
    assert.equal(first.video.transcriptSource, 'elevenlabs');
    assert.equal(first.video.language, 'hin');
    assert.deepEqual(first.video.snippets, [{ start: 0, end: 1, text: 'Docker containers' }]);
    assert.equal((await fetchTranscript('dQw4w9WgXcQ', store)).cached, true);
    assert.equal(scribeCalls, 1);
  } finally {
    globalThis.fetch = original;
    config.elevenKey = originalElevenKey;
    await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
});
test('Mastra executes retrieval, model call and grounded watchlist validation', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'unwatch-workflow-'));
  const original = globalThis.fetch;
  globalThis.fetch = async (url) =>
    String(url).includes('serpapi')
      ? Response.json({
          transcript: [
            { start_ms: 0, end_ms: 30000, snippet: 'This is a public tutorial explanation.' },
          ],
        })
      : Response.json({
          choices: [
            {
              finish_reason: 'stop',
              message: {
                content: JSON.stringify({
                  title: 'Grounded comparison',
                  sections: [
                    {
                      source: 'a',
                      title: 'Base',
                      startIndex: 0,
                      endIndex: 0,
                      kind: 'baseline',
                      confidence: 'high',
                      reason: 'Foundation.',
                    },
                    {
                      source: 'b',
                      title: 'Same explanation',
                      startIndex: 0,
                      endIndex: 0,
                      kind: 'overlap',
                      addsDistinctDetail: false,
                      confidence: 'high',
                      reason: 'Same explanation in A.',
                      matchStartIndex: 0,
                      matchEndIndex: 0,
                    },
                  ],
                }),
              },
            },
          ],
          usage: { prompt_tokens: 1000, completion_tokens: 200 },
        });
  try {
    const workflow = comparisonWorkflow(new LocalStore(dir));
    const run = await workflow.createRun();
    const outcome = await run.start({
      inputData: { a: 'dQw4w9WgXcQ', b: 'M7lc1UVf-VE', mode: 'new' },
    });
    assert.equal(outcome.status, 'success');
    if (outcome.status === 'success') {
      assert.equal(outcome.result.demo, false);
      assert.equal(outcome.result.segments[1].suggested, false);
      assert.equal(outcome.result.usage?.costUsd, 0.00025);
    }
  } finally {
    globalThis.fetch = original;
    await rm(dir, { recursive: true, force: true });
  }
});

test('analyzes a long second tutorial in bounded chunks without dropping its timeline', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'unwatch-long-'));
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (_url, init) => {
    calls++;
    const request = JSON.parse(String(init?.body));
    const captions = JSON.parse(request.messages[1].content);
    assert.equal(captions.b.captions.length, 1);
    return Response.json({
      choices: [
        {
          finish_reason: 'stop',
          message: {
            content: JSON.stringify({
              title: 'Docker lessons',
              sections: [
                {
                  source: 'a',
                  title: 'Base',
                  startIndex: 0,
                  endIndex: 0,
                  kind: 'baseline',
                  confidence: 'high',
                  reason: 'Foundation.',
                },
                {
                  source: 'b',
                  title: 'Next lesson',
                  startIndex: 0,
                  endIndex: 0,
                  kind: 'new',
                  confidence: 'high',
                  reason: 'Distinct content.',
                },
              ],
            }),
          },
        },
      ],
      usage: { prompt_tokens: 100, completion_tokens: 50 },
    });
  };
  try {
    const a = {
      id: 'dQw4w9WgXcQ',
      title: 'A',
      language: 'en',
      duration: 30,
      snippets: [{ start: 0, end: 30, text: 'Docker basics' }],
    };
    const b = {
      id: 'M7lc1UVf-VE',
      title: 'B',
      language: 'en',
      duration: 5400,
      snippets: [
        { start: 0, end: 1800, text: 'First lesson' },
        { start: 1800, end: 3600, text: 'Second lesson' },
        { start: 3600, end: 5400, text: 'Third lesson' },
      ],
    };
    const result = await analyze({ a, b }, 'new', 0, new LocalStore(dir));
    assert.equal(calls, 3);
    assert.equal(result.videos.b.duration, 5400);
    assert.deepEqual(
      result.segments.filter((s) => s.source === 'b').map((s) => [s.start, s.end]),
      [
        [0, 1800],
        [1800, 3600],
        [3600, 5400],
      ],
    );
    assert.equal(result.usage?.inputTokens, 300);
  } finally {
    globalThis.fetch = original;
    await rm(dir, { recursive: true, force: true });
  }
});

test('matches a short next tutorial against later parts of a long first tutorial', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'unwatch-long-first-'));
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (_url, init) => {
    calls++;
    const request = JSON.parse(String(init?.body));
    const captions = JSON.parse(request.messages[1].content);
    const laterPart = captions.a.captions[0].start > 0;
    return Response.json({
      choices: [
        {
          finish_reason: 'stop',
          message: {
            content: JSON.stringify({
              title: 'Docker lessons',
              sections: [
                {
                  source: 'a',
                  title: 'Base',
                  startIndex: 0,
                  endIndex: 0,
                  kind: 'baseline',
                  confidence: 'high',
                  reason: 'Foundation.',
                },
                {
                  source: 'b',
                  title: 'Next lesson',
                  startIndex: 0,
                  endIndex: 0,
                  kind: laterPart ? 'overlap' : 'new',
                  confidence: 'high',
                  reason: 'Same explanation.',
                  addsDistinctDetail: false,
                  matchStartIndex: laterPart ? 0 : null,
                  matchEndIndex: laterPart ? 0 : null,
                },
              ],
            }),
          },
        },
      ],
      usage: { prompt_tokens: 100, completion_tokens: 50 },
    });
  };
  try {
    const a = {
      id: 'dQw4w9WgXcQ',
      title: 'A',
      language: 'en',
      duration: 5400,
      snippets: [
        { start: 0, end: 1800, text: 'First lesson' },
        { start: 1800, end: 3600, text: 'Second lesson' },
        { start: 3600, end: 5400, text: 'Third lesson' },
      ],
    };
    const b = {
      id: 'M7lc1UVf-VE',
      title: 'B',
      language: 'en',
      duration: 30,
      snippets: [{ start: 0, end: 30, text: 'Docker basics' }],
    };
    const result = await analyze({ a, b }, 'new', 0, new LocalStore(dir));
    assert.equal(calls, 3);
    assert.equal(result.videos.a.duration, 5400);
    assert.deepEqual(
      result.segments.filter((s) => s.source === 'a').map((s) => [s.start, s.end]),
      [
        [0, 1800],
        [1800, 3600],
        [3600, 5400],
      ],
    );
    assert.equal(result.segments.find((s) => s.source === 'b')?.suggested, false);
  } finally {
    globalThis.fetch = original;
    await rm(dir, { recursive: true, force: true });
  }
});

test('a malformed long-video part is kept while valid parts remain usable; cost is not understated', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'unwatch-partial-'));
  const original = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    const captions = JSON.parse(JSON.parse(String(init?.body)).messages[1].content);
    const middle = captions.b.captions[0].start === 1800;
    return Response.json({
      choices: [
        {
          finish_reason: 'stop',
          message: {
            content: middle
              ? 'invalid json'
              : JSON.stringify({
                  title: 'Lessons',
                  sections: [
                    {
                      source: 'a',
                      title: 'Base',
                      startIndex: 0,
                      endIndex: 0,
                      kind: 'baseline',
                      confidence: 'high',
                      reason: 'Foundation.',
                    },
                    {
                      source: 'b',
                      title: 'New lesson',
                      startIndex: 0,
                      endIndex: 0,
                      kind: 'new',
                      confidence: 'high',
                      reason: 'Distinct lesson.',
                    },
                  ],
                }),
          },
        },
      ],
      usage: { prompt_tokens: 100, completion_tokens: 50 },
    });
  };
  try {
    const a = {
      id: 'dQw4w9WgXcQ',
      title: 'A',
      language: 'en',
      duration: 30,
      snippets: [{ start: 0, end: 30, text: 'Basics' }],
    };
    const b = {
      id: 'M7lc1UVf-VE',
      title: 'B',
      language: 'en',
      duration: 5400,
      snippets: [
        { start: 0, end: 1800, text: 'Lesson one' },
        { start: 1800, end: 3600, text: 'Lesson two' },
        { start: 3600, end: 5400, text: 'Lesson three' },
      ],
    };
    const result = await analyze({ a, b }, 'new', 0, new LocalStore(dir));
    const parts = result.segments.filter((s) => s.source === 'b');
    assert.deepEqual(
      parts.map((s) => [s.start, s.end]),
      [
        [0, 1800],
        [1800, 3600],
        [3600, 5400],
      ],
    );
    assert.equal(parts[1].suggested, true);
    assert.equal(parts[1].kind, 'uncertain');
    assert.equal(result.usage, undefined);
    assert.match(result.notices?.[0] || '', /remain included/);
  } finally {
    globalThis.fetch = original;
    await rm(dir, { recursive: true, force: true });
  }
});
