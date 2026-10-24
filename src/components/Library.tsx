import { ArrowRight, Trash2 } from 'lucide-react';
import { durations, time, type SavedSession } from '../../shared/domain';
export function Library({
  sessions,
  onOpen,
  onDelete,
  onNew,
}: {
  sessions: SavedSession[];
  onOpen: (session: SavedSession) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <section className="library">
      <h1>Pick up where you left off.</h1>
      <p className="page-description">
        Your comparisons, selections, and the things you’re still practising.
      </p>
      {!sessions.length ? (
        <div className="empty-state">
          <img
            className="empty-illustration"
            src="/images/learning-ribbon.webp"
            width="800"
            height="800"
            alt=""
          />
          <h2>A little less to rewatch.</h2>
          <p>Save a comparison and it will be waiting for you here.</p>
          <button className="button primary" onClick={onNew}>
            Create a watchlist
            <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <div className="session-list">
          {sessions.map((session) => (
            <article key={session.comparison.id}>
              <div>
                <span className="comparison-label">
                  {session.comparison.demo ? 'ILLUSTRATIVE EXAMPLE' : 'SAVED COMPARISON'} ·{' '}
                  {new Date(session.savedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <h2>{session.comparison.title}</h2>
                <p>
                  {time(durations(session.comparison, session.selected).watch)} selected ·{' '}
                  {Object.values(session.progress).filter((p) => p === 'understood').length}{' '}
                  {Object.values(session.progress).filter((p) => p === 'understood').length === 1
                    ? 'topic'
                    : 'topics'}{' '}
                  marked understood
                </p>
              </div>
              <div>
                <button className="button primary" onClick={() => onOpen(session)}>
                  Continue
                  <ArrowRight size={17} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`Delete ${session.comparison.title}`}
                  onClick={() => onDelete(session.comparison.id)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
