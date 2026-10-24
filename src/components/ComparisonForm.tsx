import { useState } from 'react';
import { ArrowRight, Link2, LoaderCircle } from 'lucide-react';
import { youtubeId, type Mode } from '../../shared/domain';
export function ComparisonForm({
  onCompare,
  busy,
  mode,
  setMode,
  error,
  unavailable = false,
}: {
  onCompare: (a: string, b: string) => void;
  busy: boolean;
  mode: Mode;
  setMode: (mode: Mode) => void;
  error: string;
  unavailable?: boolean;
}) {
  const [a, setA] = useState(''),
    [b, setB] = useState(''),
    [validation, setValidation] = useState('');
  return (
    <form
      className="source-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (unavailable) return;
        setValidation('');
        try {
          if (youtubeId(a) === youtubeId(b))
            throw new Error('Choose two different videos to compare.');
          onCompare(a, b);
        } catch (e) {
          setValidation((e as Error).message);
        }
      }}
    >
      <div className="source-fields">
        <label>
          <span className="field-label">
            <span>01</span>
            {mode === 'new' ? 'Already watched' : 'First tutorial'}
          </span>
          <span className="input-wrap">
            <Link2 size={18} />
            <input
              type="url"
              aria-label={
                mode === 'new' ? 'Already watched YouTube link' : 'First tutorial YouTube link'
              }
              value={a}
              onChange={(e) => setA(e.target.value)}
              placeholder="Paste a YouTube link"
              required
              disabled={busy}
            />
          </span>
        </label>
        <label>
          <span className="field-label">
            <span>02</span>
            {mode === 'new' ? 'Up next' : 'Second tutorial'}
          </span>
          <span className="input-wrap">
            <Link2 size={18} />
            <input
              type="url"
              aria-label="Second tutorial YouTube link"
              value={b}
              onChange={(e) => setB(e.target.value)}
              placeholder="Paste a YouTube link"
              required
              disabled={busy}
            />
          </span>
        </label>
      </div>
      <div className="form-actions">
        <fieldset disabled={busy} className="mode-select">
          <legend className="sr-only">Comparison mode</legend>
          <label>
            <input
              type="radio"
              name="mode"
              checked={mode === 'new'}
              onChange={() => setMode('new')}
            />
            Find what's new
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              checked={mode === 'combine'}
              onChange={() => setMode('combine')}
            />
            Combine both
          </label>
        </fieldset>
        <button className="button primary" disabled={busy || unavailable} type="submit">
          {busy ? (
            <>
              <LoaderCircle size={18} className="spin" />
              Comparing…
            </>
          ) : (
            <>
              Compare tutorials
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
      {(validation || error) && (
        <p role="alert" className="form-error">
          {validation || error}
        </p>
      )}
      {unavailable && (
        <p className="form-note">
          New comparisons are not available here yet. Choose “Replay a real result” to explore a
          saved live analysis without credits.
        </p>
      )}
      {busy && (
        <p role="status" className="form-note">
          Retrieving captions and checking explanations. You can keep exploring the current
          watchlist.
        </p>
      )}
      {mode === 'combine' && (
        <p className="form-note">
          Keep the first tutorial as your foundation, then add useful sections from the second.
        </p>
      )}
    </form>
  );
}
