import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ExternalLink, Play, RotateCcw } from 'lucide-react';
import {
  eligibleSegments,
  playbackRanges,
  time,
  type Comparison,
  type Progress,
} from '../../shared/domain';
import { loadYouTube, type YTPlayer } from '../lib/youtube';
import { Modal } from './Modal';

function YouTubeFrame({
  videoId,
  start,
  end,
  full,
  advance,
  autoplay,
}: {
  videoId: string;
  start: number;
  end: number;
  full: boolean;
  advance: () => void;
  autoplay: boolean;
}) {
  const host = useRef<HTMLDivElement>(null),
    player = useRef<YTPlayer | null>(null),
    latest = useRef({ end, full, advance });
  const [error, setError] = useState(''),
    [duration, setDuration] = useState(0);
  latest.current = { end, full, advance };
  useEffect(() => {
    let cancelled = false,
      advanced = false,
      ready = false;
    setError('');
    setDuration(0);
    const mount = document.createElement('div');
    host.current?.appendChild(mount);
    loadYouTube()
      .then((YT) => {
        if (cancelled) return;
        player.current = new YT.Player(mount, {
          width: '100%',
          height: '100%',
          videoId,
          playerVars: { playsinline: 1, origin: window.location.origin, start: Math.floor(start) },
          events: {
            onReady: (event: { target: YTPlayer }) => {
              if (cancelled) return;
              player.current = event.target;
              ready = true;
              event.target.cueVideoById({ videoId, startSeconds: full ? 0 : start });
              if (autoplay) event.target.playVideo();
            },
            onError: () =>
              setError(
                'This video cannot play here. Its owner may have disabled embedding, or it may be unavailable.',
              ),
            onStateChange: (event: { data: number }) => {
              if (event.data === 0 && !latest.current.full && !advanced) {
                advanced = true;
                latest.current.advance();
              }
            },
          },
        });
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    const timer = setInterval(() => {
      const p = player.current;
      if (!p || !ready) return;
      const realDuration = p.getDuration();
      if (realDuration) setDuration(realDuration);
      if (
        !latest.current.full &&
        !advanced &&
        p.getPlayerState() === 1 &&
        p.getCurrentTime() >= latest.current.end
      ) {
        advanced = true;
        p.pauseVideo();
        latest.current.advance();
      }
    }, 250);
    return () => {
      cancelled = true;
      clearInterval(timer);
      if (typeof player.current?.destroy === 'function') player.current.destroy();
      player.current = null;
      mount.remove();
    };
  }, [videoId, start, full, autoplay]);
  return (
    <>
      <div className="youtube-host" ref={host} />
      {error && (
        <p role="alert" className="form-error">
          {error}{' '}
          <a
            href={`https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(start)}s`}
            target="_blank"
            rel="noreferrer"
          >
            Open on YouTube
          </a>
        </p>
      )}
      {duration > end + 10 && (
        <p className="player-note">
          The video continues beyond the assessed interval. Switch to full video to check visual
          material and the ending.
        </p>
      )}
    </>
  );
}

export function Player({
  comparison,
  selected,
  progress,
  onProgress,
  onClose,
}: {
  comparison: Comparison;
  selected: string[];
  progress: Progress;
  onProgress: (id: string, value: 'understood' | 'practise') => void;
  onClose: () => void;
}) {
  const ranges = useMemo(() => playbackRanges(comparison, selected), [comparison, selected]);
  const [index, setIndex] = useState(0),
    [full, setFull] = useState(false),
    [finished, setFinished] = useState(false);
  const current = ranges[Math.min(index, ranges.length - 1)];
  const selectedSegments = eligibleSegments(comparison).filter((s) => selected.includes(s.id));
  const currentSegments = selectedSegments.filter((s) => current?.segmentIds.includes(s.id));
  function next() {
    if (index + 1 < ranges.length) setIndex(index + 1);
    else setFinished(true);
  }
  if (!current) return null;
  return (
    <Modal
      wide
      title={comparison.demo ? 'Example player preview' : 'Your shorter watchlist'}
      onClose={onClose}
    >
      <div className="player-layout">
        <div>
          {comparison.demo ? (
            <div className="demo-player">
              <div className="demo-player-top">
                <span>
                  <Play size={14} />
                  INTERACTIVE PREVIEW
                </span>
                <span>Tutorial {current.source.toUpperCase()}</span>
              </div>
              <div className="demo-lesson">
                <p>
                  {currentSegments[0]?.kind === 'example'
                    ? 'A useful new example'
                    : 'A little further, without the replay.'}
                </p>
                <h3>{currentSegments.map((s) => s.title).join(' + ')}</h3>
                <div className="demo-code">
                  {currentSegments.some((s) => s.id === 'b-state') ? (
                    <>
                      <span className="code-comment">
                        // Each update receives the previous result
                      </span>
                      <br />
                      <span>setCount</span>(count =&gt; count + 1);
                      <br />
                      <span>setCount</span>(count =&gt; count + 1);
                      <br />
                      <span>setCount</span>(count =&gt; count + 1);
                    </>
                  ) : (
                    <p>
                      {currentSegments[0]?.evidence[0]?.text ||
                        'Review the original explanation and decide what to keep.'}
                    </p>
                  )}
                </div>
              </div>
              <div className="demo-player-bottom">
                <span>
                  {time(current.start)} – {time(current.end)}
                </span>
                <span>Illustrative content · no video is playing</span>
              </div>
            </div>
          ) : (
            <YouTubeFrame
              key={`${index}-${full}`}
              videoId={comparison.videos[current.source].id}
              start={current.start}
              end={current.end}
              full={full}
              advance={next}
              autoplay={index > 0}
            />
          )}
          <div className="player-controls">
            <button
              className="button quiet"
              disabled={index === 0}
              onClick={() => {
                setFinished(false);
                setIndex(index - 1);
              }}
            >
              <ArrowLeft size={16} />
              Previous
            </button>
            <span>
              {index + 1} / {ranges.length} selected intervals
            </span>
            <button className="button primary" disabled={finished} onClick={next}>
              {index + 1 === ranges.length ? 'Finish' : 'Next section'}
              <ArrowRight size={16} />
            </button>
          </div>
          {finished && (
            <div className="completion" role="status">
              <Check size={18} />
              <span>Watchlist complete. Mark what you understood below.</span>
              <button
                onClick={() => {
                  setFinished(false);
                  setIndex(0);
                }}
              >
                <RotateCcw size={14} />
                Restart
              </button>
            </div>
          )}
          {!comparison.demo && (
            <label className="full-video-toggle">
              <input type="checkbox" checked={full} onChange={(e) => setFull(e.target.checked)} />
              Full video — turn off automatic skips{' '}
              <a
                href={`https://www.youtube.com/watch?v=${comparison.videos[current.source].id}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={14} />
                <span className="sr-only">Open current video on YouTube</span>
              </a>
            </label>
          )}
          <p className="muted player-note">
            {comparison.demo
              ? 'This preview demonstrates navigation and progress. Connect the providers to watch actual YouTube sections.'
              : 'Use the YouTube controls to start or pause. We only advance while playing. Watching does not mark a topic understood.'}
          </p>
        </div>
        <aside className="player-outline">
          <h3>Make it stick</h3>
          <p className="muted">You decide what you know.</p>
          {selectedSegments.map((s) => (
            <div className="progress-item" key={s.id}>
              <strong>{s.title}</strong>
              <span>
                Tutorial {s.source.toUpperCase()} · {time(s.start)}
              </span>
              <div>
                <button
                  className={progress[s.id] === 'understood' ? 'active' : ''}
                  aria-pressed={progress[s.id] === 'understood'}
                  onClick={() => onProgress(s.id, 'understood')}
                >
                  Got it
                  <Check size={13} />
                </button>
                <button
                  className={progress[s.id] === 'practise' ? 'active practise' : ''}
                  aria-pressed={progress[s.id] === 'practise'}
                  onClick={() => onProgress(s.id, 'practise')}
                >
                  Keep practising
                </button>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </Modal>
  );
}
