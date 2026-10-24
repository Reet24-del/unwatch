import { useState } from 'react';
import { ArrowUp, LoaderCircle, MessageSquare } from 'lucide-react';
import { Modal } from './Modal';
import { useConnection } from '../lib/api';
export function AssistantPanel({
  sessionId,
  ready,
  onClose,
  onSync,
}: {
  sessionId: string;
  ready: boolean;
  onClose: () => void;
  onSync: () => Promise<void>;
}) {
  const [question, setQuestion] = useState(''),
    [remember, setRemember] = useState(false),
    [answer, setAnswer] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const connection = useConnection();
  return (
    <Modal title="Your learning companion" onClose={onClose}>
      <div className="assistant-panel">
        <MessageSquare size={28} />
        <p>Ask about the explanations in this watchlist, or what you wanted to practise next.</p>
        {!ready && (
          <p className="notice">
            The Backboard assistant isn’t connected yet. Your local topic progress works without it.
          </p>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError('');
            try {
              await onSync();
              const result = await connection.request<{ answer: string }>('/api/assistant', {
                sessionId,
                question,
                remember,
              });
              setAnswer(result.answer);
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="sr-only" htmlFor="question">
            Question about your watchlist
          </label>
          <textarea
            id="question"
            placeholder="What does the cleanup function do?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={800}
            required
            disabled={!ready || busy}
          />
          <label className="memory-option">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={!ready || busy}
            />
            Remember my confirmed progress and preferences
          </label>
          <p className="muted small">
            Your question and caption excerpts will be sent to Backboard. Memory is optional and
            isolated to your account.
          </p>
          <button className="button primary" disabled={!ready || busy}>
            {busy ? <LoaderCircle className="spin" size={16} /> : <ArrowUp size={16} />}Ask
            companion
          </button>
        </form>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {answer && (
          <div className="assistant-answer" role="status">
            {answer}
          </div>
        )}
      </div>
    </Modal>
  );
}
