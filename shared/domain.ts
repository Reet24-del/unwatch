import { z } from 'zod';

export const modeSchema = z.enum(['new', 'combine']);
export type Mode = z.infer<typeof modeSchema>;
export const sourceSchema = z.enum(['a', 'b']);
export type Source = z.infer<typeof sourceSchema>;
export const snippetSchema = z.object({
  start: z.number().nonnegative(),
  end: z.number().positive(),
  text: z.string().max(10000),
});
export const videoSchema = z.object({
  id: z.string().regex(/^[\w-]{11}$/),
  title: z.string().max(200),
  language: z.string().max(40),
  transcriptSource: z.enum(['serpapi', 'elevenlabs']).optional(),
  duration: z.number().positive().max(10800),
  snippets: z.array(snippetSchema).min(1).max(12000),
});
export type Video = z.infer<typeof videoSchema>;
export const evidenceSchema = z.object({
  source: sourceSchema,
  start: z.number().nonnegative(),
  end: z.number().positive(),
  text: z.string().max(50000),
});
export const segmentSchema = z.object({
  id: z.string().max(100),
  source: sourceSchema,
  title: z.string().min(1).max(160),
  start: z.number().nonnegative(),
  end: z.number().positive(),
  kind: z.enum(['baseline', 'overlap', 'new', 'example', 'uncertain']),
  confidence: z.enum(['high', 'medium', 'low']),
  reason: z.string().max(1200),
  evidence: z.array(evidenceSchema).max(2),
  suggested: z.boolean(),
});
export type Segment = z.infer<typeof segmentSchema>;
export const comparisonSchema = z.object({
  id: z.string().max(100),
  title: z.string().max(200),
  createdAt: z.string(),
  mode: modeSchema,
  demo: z.boolean(),
  recorded: z.boolean().optional(),
  videos: z.object({ a: videoSchema, b: videoSchema }),
  segments: z.array(segmentSchema).min(1).max(250),
  notices: z.array(z.string().max(300)).max(8).optional(),
  usage: z
    .object({
      inputTokens: z.number(),
      outputTokens: z.number(),
      costUsd: z.number(),
      cachedTranscripts: z.number(),
    })
    .optional(),
});
export type Comparison = z.infer<typeof comparisonSchema>;
export const sessionSchema = z.object({
  comparison: comparisonSchema,
  selected: z.array(z.string().max(100)).max(250),
  progress: z.record(z.string(), z.enum(['understood', 'practise'])),
  savedAt: z.string(),
});
export type SavedSession = z.infer<typeof sessionSchema>;
export type Progress = SavedSession['progress'];
export const requestSchema = z.object({
  a: z.string().max(500),
  b: z.string().max(500),
  mode: modeSchema,
});

export function youtubeId(input: string): string {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new Error('Paste a full YouTube link, starting with https://.');
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port)
    throw new Error('Use a normal HTTPS YouTube link.');
  const host = url.hostname.toLowerCase();
  let id: string | null = null;
  if (host === 'youtu.be') id = url.pathname.split('/')[1];
  else if (
    ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host)
  ) {
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    else if (/^\/(embed|shorts|live)\//.test(url.pathname)) id = url.pathname.split('/')[2];
  }
  if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id))
    throw new Error('That link does not identify a supported YouTube video.');
  return id;
}

export function time(seconds: number): string {
  const value = Math.max(0, Math.floor(seconds));
  return `${Math.floor(value / 60)
    .toString()
    .padStart(2, '0')}:${(value % 60).toString().padStart(2, '0')}`;
}
export function eligibleSegments(comparison: Comparison) {
  return comparison.segments.filter((s) => comparison.mode === 'combine' || s.source === 'b');
}
export function defaultSelection(comparison: Comparison): string[] {
  return eligibleSegments(comparison)
    .filter((s) => s.suggested)
    .map((s) => s.id);
}
export type PlaybackRange = { source: Source; start: number; end: number; segmentIds: string[] };
export function playbackRanges(
  comparison: Comparison,
  selected: string[],
  padding = 2,
): PlaybackRange[] {
  const ranges: PlaybackRange[] = [];
  for (const source of ['a', 'b'] as const) {
    const segments = eligibleSegments(comparison)
      .filter((s) => s.source === source && selected.includes(s.id))
      .sort((a, b) => a.start - b.start);
    for (const s of segments) {
      const start = Math.max(0, s.start - padding),
        end = Math.min(comparison.videos[source].duration, s.end + padding);
      const last = ranges.at(-1);
      if (last && last.source === source && start <= last.end) {
        last.end = Math.max(last.end, end);
        last.segmentIds.push(s.id);
      } else ranges.push({ source, start, end, segmentIds: [s.id] });
    }
  }
  return ranges;
}
export function durations(comparison: Comparison, selected: string[]) {
  const total =
    comparison.videos.b.duration +
    (comparison.mode === 'combine' ? comparison.videos.a.duration : 0);
  const watch = playbackRanges(comparison, selected).reduce((sum, r) => sum + r.end - r.start, 0);
  return { total, watch, omitted: Math.max(0, total - watch) };
}

export const modelOutputSchema = z.object({
  title: z.string().min(1).max(200),
  sections: z
    .array(
      z.object({
        source: sourceSchema,
        title: z.string().min(1).max(160),
        startIndex: z.number().int().nonnegative(),
        endIndex: z.number().int().nonnegative(),
        kind: z.enum(['baseline', 'overlap', 'new', 'example', 'uncertain']),
        confidence: z.enum(['high', 'medium', 'low']),
        reason: z.string().min(1).max(1200),
        addsDistinctDetail: z.boolean().optional(),
        matchStartIndex: z.number().int().nonnegative().nullable().optional(),
        matchEndIndex: z.number().int().nonnegative().nullable().optional(),
      }),
    )
    .min(2)
    .max(48),
});

export function materializeSections(
  output: z.infer<typeof modelOutputSchema>,
  videos: { a: Video; b: Video },
): Segment[] {
  const result: Segment[] = [];
  for (const source of ['a', 'b'] as const) {
    const snippets = videos[source].snippets;
    const sections = output.sections
      .filter((s) => s.source === source)
      .sort((a, b) => a.startIndex - b.startIndex);
    if (!sections.length) throw new Error('The analysis did not cover both sources.');
    let previousIndex = -1,
      cursor = 0;
    const gap = (start: number, end: number) => {
      if (end - start <= 0.01) return;
      result.push({
        id: `${source}-gap-${result.length}`,
        source,
        title: 'Keep for context',
        start,
        end,
        kind: 'uncertain',
        confidence: 'low',
        reason:
          'This interval is not fully assessed from captions. Kept so visual context is not lost.',
        evidence: [],
        suggested: true,
      });
    };
    for (const section of sections) {
      const { startIndex, endIndex } = section;
      if (startIndex <= previousIndex || endIndex < startIndex || endIndex >= snippets.length)
        throw new Error('The analysis returned invalid or overlapping caption references.');
      const start = snippets[startIndex].start,
        end = snippets[endIndex].end;
      if (start < cursor - 0.01 || end <= start || end > videos[source].duration)
        throw new Error('The analysis returned invalid timestamp ranges.');
      gap(cursor, start);
      let kind = source === 'a' ? ('baseline' as const) : section.kind;
      if (source === 'b' && kind === 'baseline') kind = 'uncertain';
      const evidence: Segment['evidence'] = [
        {
          source,
          start,
          end,
          text: snippets
            .slice(startIndex, endIndex + 1)
            .map((s) => s.text)
            .join(' ')
            .slice(0, 50000),
        },
      ];
      const mStart = section.matchStartIndex,
        mEnd = section.matchEndIndex;
      if (source === 'b' && mStart != null && mEnd != null) {
        if (mStart > mEnd || mEnd >= videos.a.snippets.length)
          throw new Error('The comparison cites a caption that does not exist.');
        evidence.push({
          source: 'a',
          start: videos.a.snippets[mStart].start,
          end: videos.a.snippets[mEnd].end,
          text: videos.a.snippets
            .slice(mStart, mEnd + 1)
            .map((s) => s.text)
            .join(' ')
            .slice(0, 50000),
        });
      }
      const captionGap = snippets
        .slice(startIndex, endIndex + 1)
        .some((s, i, all) => i > 0 && s.start - all[i - 1].end > 20);
      let reason = section.reason;
      if (
        kind === 'overlap' &&
        (evidence.length < 2 ||
          section.confidence !== 'high' ||
          captionGap ||
          section.addsDistinctDetail !== false)
      ) {
        kind = 'uncertain';
        reason =
          'Kept: equivalence is uncertain, additional detail may be present, or captions leave a gap. ' +
          reason;
      }
      result.push({
        id: `${source}-${startIndex}-${endIndex}`,
        source,
        title: section.title,
        start,
        end,
        kind,
        confidence: section.confidence,
        reason: reason.slice(0, 1200),
        evidence,
        suggested: kind !== 'overlap',
      });
      cursor = end;
      previousIndex = endIndex;
    }
    gap(cursor, videos[source].duration);
  }
  return result;
}

/** Keep usable model sections; never turn an invalid citation into a skip. */
export function materializeConservatively(
  output: z.infer<typeof modelOutputSchema>,
  videos: { a: Video; b: Video },
): Segment[] {
  try {
    return materializeSections(output, videos);
  } catch {
    const sections: z.infer<typeof modelOutputSchema>['sections'] = [];
    for (const source of ['a', 'b'] as const) {
      const snippets = videos[source].snippets;
      let previousIndex = -1;
      for (const section of output.sections
        .filter((candidate) => candidate.source === source)
        .sort((a, b) => a.startIndex - b.startIndex)) {
        const { startIndex, endIndex } = section;
        if (
          startIndex <= previousIndex ||
          endIndex < startIndex ||
          endIndex >= snippets.length ||
          snippets[startIndex].start < 0 ||
          snippets[endIndex].end <= snippets[startIndex].start ||
          snippets[endIndex].end > videos[source].duration
        )
          continue;
        const matchValid =
          section.matchStartIndex != null &&
          section.matchEndIndex != null &&
          section.matchStartIndex <= section.matchEndIndex &&
          section.matchEndIndex < videos.a.snippets.length;
        sections.push({
          ...section,
          ...(source === 'b' && section.kind === 'overlap' && !matchValid
            ? {
                kind: 'uncertain' as const,
                confidence: 'low' as const,
                reason: 'Kept because the suggested match could not be verified.',
              }
            : {}),
          matchStartIndex: matchValid ? section.matchStartIndex : null,
          matchEndIndex: matchValid ? section.matchEndIndex : null,
        });
        previousIndex = endIndex;
      }
      if (!sections.some((section) => section.source === source) && snippets.length)
        sections.push({
          source,
          title: 'Review full tutorial',
          startIndex: 0,
          endIndex: snippets.length - 1,
          kind: source === 'a' ? 'baseline' : 'uncertain',
          confidence: 'low',
          reason:
            'The suggested section references could not be verified, so this video is kept in full.',
          matchStartIndex: null,
          matchEndIndex: null,
        });
    }
    return materializeSections({ ...output, sections }, videos);
  }
}
