import {
  ArrowRight,
  BookmarkPlus,
  Check,
  ChevronDown,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import {
  durations,
  eligibleSegments,
  time,
  type Comparison,
  type Segment,
} from '../../shared/domain';
import { Modal } from './Modal';
import { AnimatedNumber } from './AnimatedNumber';
export function ComparisonView({
  comparison,
  selected,
  onToggle,
  onSelectAll,
  onReset,
  onWatch,
  onSave,
  saved,
}: {
  comparison: Comparison;
  selected: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onReset: () => void;
  onWatch: () => void;
  onSave: () => void;
  saved: boolean;
}) {
  const [evidence, setEvidence] = useState<Segment | null>(null);
  const [filter, setFilter] = useState<'all' | 'skipped' | 'included'>('all');
  const sections = eligibleSegments(comparison);
  const skipped = sections.filter((s) => !selected.includes(s.id));
  const visibleSections = sections.filter((s) =>
    filter === 'all' || (filter === 'skipped' ? !selected.includes(s.id) : selected.includes(s.id)),
  );
  const d = durations(comparison, selected);
  return (
    <section className="comparison" aria-label="Tutorial comparison">
      <div className="comparison-heading">
        <div>
          <p className="comparison-label">
            {comparison.demo ? 'EXAMPLE COMPARISON' : 'YOUR COMPARISON'}{' '}
            <span>
              · {comparison.demo
                ? 'Illustrative data'
                : Object.values(comparison.videos).some((video) => video.transcriptSource === 'elevenlabs')
                  ? 'Based on captions and AI transcripts'
                  : 'Based on available captions'}
            </span>
          </p>
          <h2>{comparison.title}</h2>
        </div>
        <div className="time-summary">
          <div>
            <strong>
              <AnimatedNumber value={Math.round(d.watch / 60)} /> <small>min</small>
            </strong>
            <span>to watch</span>
          </div>
          <div>
            <strong>
              <AnimatedNumber value={Math.round(d.omitted / 60)} /> <small>min</small>
            </strong>
            <span>left out</span>
          </div>
        </div>
      </div>
      {comparison.notices?.map((notice) => <p className="form-note" role="status" key={notice}>{notice}</p>)}
      <div className="timelines">
        {(['a', 'b'] as const).map((source) => (
          <div className="timeline-row" key={source}>
            <div className="timeline-source">
              <strong>Tutorial {source.toUpperCase()}</strong>
              <span title={comparison.videos[source].title}>{comparison.videos[source].title}</span>
              {comparison.videos[source].transcriptSource === 'elevenlabs' && (
                <span>AI transcript</span>
              )}
              <b>{time(comparison.videos[source].duration)}</b>
            </div>
            <div className="timeline-track">
              <div className="timeline-blocks">
                {comparison.segments
                  .filter((s) => s.source === source)
                  .map((s) => (
                    <button
                      key={s.id}
                      className={`timeline-block ${s.kind}`}
                      style={{
                        flexBasis: `${((s.end - s.start) / comparison.videos[source].duration) * 100}%`,
                      }}
                      onClick={() => setEvidence(s)}
                      aria-label={`${s.title}, ${time(s.start)} to ${time(s.end)}. View caption evidence.`}
                    >
                      <span>{s.title}</span>
                    </button>
                  ))}
              </div>
              <div className="timeline-scale">
                <span>00:00</span>
                <span>{time(comparison.videos[source].duration / 2)}</span>
                <span>{time(comparison.videos[source].duration)}</span>
              </div>
            </div>
          </div>
        ))}
        <div className="timeline-legend">
          <span>
            <i className="legend-dot overlap" />
            Already covered
          </span>
          <span>
            <i className="legend-dot new" />
            New or useful detail
          </span>
          <span>
            <i className="legend-dot uncertain" />
            Keep for context
          </span>
          <span className="coverage-note">Times reflect transcript coverage</span>
        </div>
      </div>
      <div className="watchlist-panel">
        <div className="review-callout">
          <div className="review-callout-icon" aria-hidden="true">↗</div>
          <div>
            <span className="review-eyebrow">BEFORE YOU PRESS PLAY</span>
            <h3>{skipped.length ? `Review ${skipped.length} section${skipped.length === 1 ? '' : 's'} left out` : 'Nothing is left out'}</h3>
            <p>
              {skipped.length
                ? 'These sections are excluded from your watchlist. Open the caption evidence, then include anything you still want to watch.'
                : 'The comparison did not find a safe shortcut with your current choices. Keep the full context or adjust the sections below.'}
            </p>
          </div>
          {skipped.length > 0 && (
            <button className="review-link" onClick={() => setFilter('skipped')}>
              Review left-out sections <ArrowRight size={16} />
            </button>
          )}
        </div>
        <div className="watchlist-heading">
          <h2>Your watchlist</h2>
          <div className="watchlist-actions">
            <button
              className="button quiet"
              aria-label={saved ? 'Saved' : 'Save session'}
              onClick={onSave}
            >
              {saved ? <Check size={17} /> : <BookmarkPlus size={17} />}
              <span>{saved ? 'Saved' : 'Save session'}</span>
            </button>
            <button className="button primary" disabled={!selected.length} onClick={onWatch}>
              Watch selected
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <div className="list-toolbar">
          <span>
            {selected.filter((id) => sections.some((s) => s.id === id)).length}{' '}
            of {sections.length} sections selected · {time(d.watch)} with
            context
          </span>
          <div>
            <button onClick={onSelectAll}>Select all</button>
            <button onClick={onReset}>
              <RotateCcw size={12} />
              Reset suggestions
            </button>
          </div>
        </div>
        <div className="watchlist-filters" aria-label="Filter watchlist sections">
          {([
            ['all', 'All', sections.length],
            ['skipped', 'Left out', skipped.length],
            ['included', 'Included', sections.length - skipped.length],
          ] as const).map(([value, label, count]) => (
            <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>
              {label} <span>{count}</span>
            </button>
          ))}
        </div>
        <div className="watchlist-table">
          <div className="watchlist-columns">
            <span>Topic</span>
            <span>Why it’s here</span>
            <span>Time</span>
            <span>Include</span>
          </div>
          {visibleSections.map((s) => (
            <div
              key={s.id}
              className={`watchlist-row ${selected.includes(s.id) ? 'included' : ''}`}
            >
              <button className="topic-button" onClick={() => setEvidence(s)}>
                <span className={`topic-dot ${s.kind}`} />
                <span>
                  {s.title}
                  {comparison.mode === 'combine' && (
                    <small>Tutorial {s.source.toUpperCase()}</small>
                  )}
                </span>
                <ChevronDown size={14} />
              </button>
              <div className="reason-cell">
                <span>{s.reason}</span>
                <button onClick={() => setEvidence(s)}>View evidence</button>
              </div>
              <span className="time-cell">
                {time(s.start)}–{time(s.end)}
              </span>
              <label className="include-cell">
                <input
                  type="checkbox"
                  checked={selected.includes(s.id)}
                  onChange={() => onToggle(s.id)}
                  aria-label={`Include ${s.title} from tutorial ${s.source.toUpperCase()}`}
                />
                <span className="mobile-only">Include section</span>
              </label>
            </div>
          ))}
          {!visibleSections.length && (
            <p className="watchlist-empty">No sections in this view. Choose another filter above.</p>
          )}
        </div>
        <p className="list-footnote">
          Suggestions use captions or AI transcripts. Keep visual demonstrations when unsure. Selection includes 2
          seconds of surrounding context.
        </p>
      </div>
      {evidence && (
        <Modal title={evidence.title} onClose={() => setEvidence(null)}>
          <div className="evidence-content">
            <p>{evidence.reason}</p>
            <div className="evidence-meta">
              {comparison.demo ? 'Illustrative caption excerpts' : 'Exact source caption excerpts'}{' '}
              · {evidence.confidence} confidence
            </div>
            {evidence.evidence.length ? (
              evidence.evidence.map((e, i) => (
                <article className="evidence-quote" key={i}>
                  <div>
                    <strong>Tutorial {e.source.toUpperCase()}</strong>
                    <span>
                      {time(e.start)}–{time(e.end)}
                    </span>
                  </div>
                  <blockquote>{e.text}</blockquote>
                  {!comparison.demo && (
                    <a
                      href={`https://www.youtube.com/watch?v=${comparison.videos[e.source].id}&t=${Math.floor(e.start)}s`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open source at {time(e.start)}
                      <ExternalLink size={14} />
                    </a>
                  )}
                </article>
              ))
            ) : (
              <p>
                No caption evidence covers this interval. It remains selected to preserve context.
              </p>
            )}
            <p className="muted">
              {comparison.demo
                ? 'These excerpts were written for the example. They are not a real video analysis.'
                : 'Caption evidence supports review; model confidence is not a guarantee that two explanations are equivalent.'}
            </p>
          </div>
        </Modal>
      )}
    </section>
  );
}
