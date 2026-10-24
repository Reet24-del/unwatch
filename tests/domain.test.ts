import test from 'node:test';
import assert from 'node:assert/strict';
import {
  comparisonSchema,
  defaultSelection,
  durations,
  materializeSections,
  materializeConservatively,
  playbackRanges,
  youtubeId,
  type Video,
} from '../shared/domain';
import { makeDemo } from '../src/lib/demo';

test('accepts YouTube URL forms but rejects lookalikes and arbitrary hosts', () => {
  for (const link of [
    'https://youtu.be/dQw4w9WgXcQ?t=5',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://m.youtube.com/shorts/dQw4w9WgXcQ',
    'https://youtube.com/embed/dQw4w9WgXcQ',
    'https://youtube.com/live/dQw4w9WgXcQ',
  ])
    assert.equal(youtubeId(link), 'dQw4w9WgXcQ');
  for (const link of [
    'https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ',
    'http://youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com@evil.test/watch?v=dQw4w9WgXcQ',
    'https://youtu.be:8080/dQw4w9WgXcQ',
    'javascript:alert(1)',
    'https://www.youtube.com/watch?v=short',
    'https://127.0.0.1/internal',
  ])
    assert.throws(() => youtubeId(link));
});

test('demo has valid schema, consistent durations and no double counting with padding', () => {
  const demo = comparisonSchema.parse(makeDemo());
  const selected = defaultSelection(demo),
    ranges = playbackRanges(demo, selected);
  assert.equal(selected.length, 2);
  assert.equal(ranges.length, 1);
  assert.deepEqual([ranges[0].start, ranges[0].end], [718, 1802]);
  const d = durations(demo, selected);
  assert.equal(d.watch, 1084);
  assert.equal(d.watch + d.omitted, 3000);
  assert.equal(
    durations(
      demo,
      demo.segments.map((s) => s.id),
    ).watch,
    3000,
  );
  assert.equal(durations(demo, []).watch, 0);
  const combined = makeDemo('combine');
  assert.equal(durations(combined, defaultSelection(combined)).watch, 3964);
});

const video: Video = {
  id: 'dQw4w9WgXcQ',
  title: 'Fixture',
  language: 'en',
  duration: 30,
  snippets: [
    { start: 0, end: 10, text: 'First explanation.' },
    { start: 10, end: 20, text: 'Second explanation.' },
    { start: 20, end: 30, text: 'Another example.' },
  ],
};
const base = {
  title: 'Comparison',
  sections: [
    {
      source: 'a' as const,
      title: 'Base',
      startIndex: 0,
      endIndex: 2,
      kind: 'baseline' as const,
      confidence: 'high' as const,
      reason: 'Base explanation.',
    },
    {
      source: 'b' as const,
      title: 'Repeated',
      startIndex: 0,
      endIndex: 2,
      kind: 'overlap' as const,
      confidence: 'high' as const,
      reason: 'The same explanation.',
      addsDistinctDetail: false,
      matchStartIndex: 0,
      matchEndIndex: 2,
    },
  ],
};
test('only strong, cited overlap is unselected', () => {
  const result = materializeSections(base, { a: video, b: video });
  assert.equal(result[1].suggested, false);
  assert.equal(
    result[1].evidence[1].text,
    'First explanation. Second explanation. Another example.',
  );
  const low = {
    ...base,
    sections: [base.sections[0], { ...base.sections[1], confidence: 'low' as const }],
  };
  assert.equal(materializeSections(low, { a: video, b: video })[1].kind, 'uncertain');
  const missing = {
    ...base,
    sections: [
      base.sections[0],
      { ...base.sections[1], matchStartIndex: null, matchEndIndex: null },
    ],
  };
  assert.equal(materializeSections(missing, { a: video, b: video })[1].suggested, true);
});
test('rejects invented citations and overlapping output; preserves uncovered intervals', () => {
  assert.throws(() =>
    materializeSections(
      { ...base, sections: [base.sections[0], { ...base.sections[1], matchEndIndex: 9 }] },
      { a: video, b: video },
    ),
  );
  assert.throws(() =>
    materializeSections(
      { ...base, sections: [...base.sections, base.sections[1]] },
      { a: video, b: video },
    ),
  );
  const partial = {
    ...base,
    sections: [base.sections[0], { ...base.sections[1], startIndex: 1, endIndex: 1 }],
  };
  const result = materializeSections(partial, { a: video, b: video }).filter(
    (s) => s.source === 'b',
  );
  assert.deepEqual(
    result.map((s) => [s.start, s.end, s.suggested]),
    [
      [0, 10, true],
      [10, 20, false],
      [20, 30, true],
    ],
  );
});
test('long silent gaps within an overlap section are retained', () => {
  const sparse = {
    ...video,
    duration: 90,
    snippets: [
      { start: 0, end: 10, text: 'Hello' },
      { start: 70, end: 80, text: 'Again' },
      { start: 80, end: 90, text: 'Done' },
    ],
  };
  assert.equal(materializeSections(base, { a: video, b: sparse })[1].suggested, true);
});

test('cited overlap with an additional caveat or an absent detail assessment stays included', () => {
  for (const addsDistinctDetail of [true, undefined]) {
    const mixed = {
      ...base,
      sections: [base.sections[0], {
        ...base.sections[1],
        reason: 'Repeats the VM comparison but also adds the OS-compatibility caveat.',
        addsDistinctDetail,
      }],
    };
    const section = materializeSections(mixed, { a: video, b: video })[1];
    assert.equal(section.suggested, true);
    assert.equal(section.kind, 'uncertain');
  }
});

test('invalid model citations keep the affected material instead of failing the watchlist', () => {
  const invalidMatch = {
    ...base,
    sections: [base.sections[0], { ...base.sections[1], matchEndIndex: 999 }],
  };
  const result = materializeConservatively(invalidMatch, { a: video, b: video });
  assert.equal(result.find((section) => section.source === 'b')?.kind, 'uncertain');
  assert.equal(result.find((section) => section.source === 'b')?.suggested, true);

  const overlapping = { ...base, sections: [...base.sections, base.sections[1]] };
  const repaired = materializeConservatively(overlapping, { a: video, b: video });
  assert.equal(repaired.filter((section) => section.source === 'b').length, 1);
  assert.equal(repaired[1].suggested, false);
});
