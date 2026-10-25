import { useEffect, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { WorkspaceHero } from './components/WorkspaceHero';
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  CloudUpload,
  FastForward,
  Home,
  Laptop,
  LogOut,
  MessageSquare,
  Settings2,
  X,
} from 'lucide-react';
import {
  comparisonSchema,
  defaultSelection,
  eligibleSegments,
  type Comparison,
  type Mode,
  type Progress,
  type SavedSession,
} from '../shared/domain';
import { makeDemo } from './lib/demo';
import { readSessions, writeSessions } from './lib/storage';
import { useConnection, type AppConfig } from './lib/api';
import { ComparisonForm } from './components/ComparisonForm';
import { ComparisonView } from './components/ComparisonView';
import { Player } from './components/Player';
import { Library } from './components/Library';
import { Modal } from './components/Modal';
import { AssistantPanel } from './components/AssistantPanel';

type Page = 'workspace' | 'saved' | 'how';
const sponsors = [
  ['SerpApi', 'YouTube captions'],
  ['ElevenLabs', 'Audio transcription when captions are missing'],
  ['Ultramarine', 'Explanation comparison'],
  ['Mastra', 'Analysis workflow'],
  ['MongoDB', 'Durable storage'],
  ['Backboard', 'Learning memory'],
  ['Sentry', 'Request tracing'],
];
export default function App({ config }: { config: AppConfig }) {
  const reduceMotion = useReducedMotion();
  const [initialSession] = useState(() => readSessions()[0]);
  const [page, setPage] = useState<Page>('workspace'),
    [mode, setMode] = useState<Mode>(() => initialSession?.comparison.mode || 'new');
  const [comparison, setComparison] = useState<Comparison>(
    () => initialSession?.comparison || makeDemo(),
  );
  const [selected, setSelected] = useState<string[]>(
    () => initialSession?.selected || defaultSelection(makeDemo()),
  );
  const [progress, setProgress] = useState<Progress>(() => initialSession?.progress || {});
  const [sessions, setSessions] = useState<SavedSession[]>(readSessions);
  const [busy, setBusy] = useState(false),
    [compareFailed, setCompareFailed] = useState(false),
    [error, setError] = useState(''),
    [toast, setToast] = useState('');
  const [player, setPlayer] = useState(false),
    [settings, setSettings] = useState(false),
    [assistant, setAssistant] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const connection = useConnection();
  const saved = sessions.some((s) => s.comparison.id === comparison.id);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    setSessions((current) => {
      if (!current.some((s) => s.comparison.id === comparison.id)) return current;
      const next = current.map((s) =>
        s.comparison.id === comparison.id
          ? { comparison, selected, progress, savedAt: new Date().toISOString() }
          : s,
      );
      try {
        writeSessions(next);
      } catch (e) {
        setError((e as Error).message);
      }
      return next;
    });
  }, [comparison, selected, progress]);
  function load(c: Comparison, selection = defaultSelection(c), knowledge: Progress = {}) {
    setComparison(c);
    setSelected(selection);
    setProgress(knowledge);
    setMode(c.mode);
    setPage('workspace');
    setError('');
    setCompareFailed(false);
  }
  function changeMode(m: Mode) {
    setMode(m);
    const next = { ...comparison, mode: m };
    setComparison(next);
    setSelected(defaultSelection(next));
  }
  function currentSession(): SavedSession {
    return { comparison, selected, progress, savedAt: new Date().toISOString() };
  }
  function save() {
    const next = [
      currentSession(),
      ...sessions.filter((s) => s.comparison.id !== comparison.id),
    ].slice(0, 20);
    try {
      writeSessions(next);
      setSessions(next);
      setToast('Session saved on this device.');
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function sync() {
    await connection.request(`/api/sessions/${comparison.id}`, currentSession(), 'PUT');
  }
  async function compare(a: string, b: string) {
    setBusy(true);
    setCompareFailed(false);
    setError('');
    try {
      const result = comparisonSchema.parse(
        await connection.request('/api/compare', { a, b, mode }),
      );
      load(result);
      setToast('Comparison ready. Review the suggestions before watching.');
    } catch (e) {
      setCompareFailed(true);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const nav = [
    { id: 'workspace' as const, label: 'Workspace', icon: Home },
    { id: 'saved' as const, label: 'Saved sessions', icon: Bookmark },
    { id: 'how' as const, label: 'How it works', icon: BookOpen },
  ];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to workspace
      </a>
      <aside className="sidebar">
        <div>
          <button
            className="brand"
            onClick={() => setPage('workspace')}
            aria-label="UNWATCH workspace"
          >
            <FastForward size={27} fill="currentColor" strokeWidth={0} />
            <span>UNWATCH</span>
          </button>
          <p className="tagline">Your learning, minus the replay.</p>
          <nav aria-label="Main navigation">
            {nav.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`nav-item ${page === id ? 'active' : ''}`}
                onClick={() => setPage(id)}
                aria-current={page === id ? 'page' : undefined}
              >
                {page === id && (
                  <m.span
                    className="nav-active"
                    layoutId="active-navigation"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    aria-hidden="true"
                  />
                )}
                <Icon size={19} />
                <span>{label}</span>
                {id === 'saved' && sessions.length > 0 && <small>{sessions.length}</small>}
              </button>
            ))}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <button
            className="connection-button"
            aria-label="Workspace connections"
            onClick={() => setSettings(true)}
          >
            <Laptop size={20} />
            <span>
              <strong>{connection.signedIn ? 'Personal workspace' : 'Local workspace'}</strong>
              <small>Saved on this device</small>
            </span>
            <Settings2 size={15} />
          </button>
          {connection.configured && (
            <button
              className="auth-button"
              onClick={connection.signedIn ? connection.logout : connection.login}
              disabled={connection.loading}
              aria-label={connection.signedIn ? 'Sign out' : 'Sign in to connect your learning'}
            >
              {connection.signedIn ? (
                <>
                  <LogOut size={14} />
                  Sign out
                </>
              ) : (
                <>
                  <span className="auth-label">Sign in to connect your learning</span>
                  <span className="auth-short" aria-hidden="true">
                    Sign in
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>
      <main id="main">
        <div className="topbar">
          <div>
            <a href="/" className="workspace-home">Home</a> <span>/</span>{' '}
            {page === 'workspace'
              ? 'New comparison'
              : page === 'saved'
                ? 'Saved sessions'
                : 'How it works'}
          </div>
          <div className="topbar-actions">
            <button
              onClick={() => {
                void fetch('/examples/react-comparison.json')
                  .then((response) => {
                    if (!response.ok)
                      throw new Error('The recorded comparison could not be loaded.');
                    return response.json();
                  })
                  .then((data: unknown) => {
                    load(comparisonSchema.parse(data));
                    setToast('Recorded live result loaded. No API credits used.');
                  })
                  .catch(() =>
                    setError(
                      'The recorded comparison could not be loaded. Try the example or reload the page.',
                    ),
                  );
              }}
              disabled={busy}
            >
              Replay a real result
              <ArrowRight size={17} />
            </button>
            <button
              onClick={() => {
                load(makeDemo(mode));
                setToast('Example loaded. No API credits used.');
              }}
              disabled={busy}
            >
              Try an example
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={page}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
          >
            {page === 'workspace' ? (
              <>
                <WorkspaceHero />
                <ComparisonForm
                  onCompare={compare}
                  busy={busy}
                  mode={mode}
                  setMode={changeMode}
                  error={error}
                  unavailable={!config.liveReady}
                />
                {!compareFailed && (
                  <ComparisonView
                    comparison={comparison}
                    selected={selected}
                    onToggle={(id) =>
                      setSelected((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]))
                    }
                    onSelectAll={() => setSelected(eligibleSegments(comparison).map((s) => s.id))}
                    onReset={() => setSelected(defaultSelection(comparison))}
                    onWatch={() => setPlayer(true)}
                    onSave={save}
                    saved={saved}
                  />
                )}
                <div className="workspace-footer">
                  <span>Less repetition. Your judgement stays in the loop.</span>
                  <div>
                    {config.capabilities.backboard && (
                      <button onClick={() => setAssistant(true)}>
                        <MessageSquare size={15} />
                        Learning companion
                      </button>
                    )}
                    {connection.signedIn && (
                      <button
                        onClick={() => {
                          void sync()
                            .then(() => setToast('Session synced to your account.'))
                            .catch((e) => setError(e.message));
                        }}
                      >
                        <CloudUpload size={15} />
                        Sync session
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : page === 'saved' ? (
              <>
                <Library
                  sessions={sessions}
                  onOpen={(s) => load(s.comparison, s.selected, s.progress)}
                  onDelete={setPendingDelete}
                  onNew={() => setPage('workspace')}
                />
                {connection.signedIn && (
                  <button
                    className="button quiet"
                    onClick={async () => {
                      try {
                        const remote = await connection.request<SavedSession[]>('/api/sessions');
                        const merged = [
                          ...remote,
                          ...sessions.filter(
                            (s) => !remote.some((r) => r.comparison.id === s.comparison.id),
                          ),
                        ];
                        writeSessions(merged);
                        setSessions(readSessions());
                        setToast('Account sessions loaded.');
                      } catch (e) {
                        setToast((e as Error).message);
                      }
                    }}
                  >
                    <CloudUpload size={16} />
                    Load account sessions
                  </button>
                )}
              </>
            ) : (
              <section className="how-page">
                <h1>A little less déjà vu.</h1>
                <p className="page-description">
                  Keep the explanations you need. Leave the repetition behind.
                </p>
                <div className="how-steps">
                  {[
                    [
                      '01',
                      'Bring two tutorials',
                      'Paste a tutorial you already watched and one you want to explore. Or combine both if you’re starting fresh.',
                    ],
                    [
                      '02',
                      'Review what’s different',
                      'Compare the caption evidence. New explanations and useful examples stay in; uncertain sections are kept by default. Restore any suggested skip.',
                    ],
                    [
                      '03',
                      'Watch on your terms',
                      'Play the selected intervals in the original YouTube player. Switch to the full video whenever you want.',
                    ],
                    [
                      '04',
                      'Remember your progress',
                      'Mark a topic understood only when you feel ready. Save your session to return to the bits that still need practice.',
                    ],
                  ].map(([n, title, text]) => (
                    <article key={n}>
                      <span>{n}</span>
                      <div>
                        <h2>{title}</h2>
                        <p>{text}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="honest-note">
                  <h3>A useful shortcut, with limits.</h3>
                  <p>
                    UNWATCH compares spoken transcripts, not video frames. Diagrams, silent coding
                    and imperfect transcripts can hide important differences. Keep visual
                    demonstrations when unsure. The example workspace uses authored illustrative
                    content, not a live analysis.
                  </p>
                  <p>
                    For the first version: two public videos, each under three hours. Longer second
                    tutorials are compared in parts. Requests use limited prototype credits.
                  </p>
                  <button className="button primary" onClick={() => setPage('workspace')}>
                    Back to workspace
                    <ArrowRight size={17} />
                  </button>
                </div>
              </section>
            )}
          </m.div>
        </AnimatePresence>
      </main>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          <span>{toast}</span>
          <button aria-label="Dismiss notification" onClick={() => setToast('')}>
            <X size={15} />
          </button>
        </div>
      )}
      {player && (
        <Player
          comparison={comparison}
          selected={selected}
          progress={progress}
          onProgress={(id, value) => setProgress((p) => ({ ...p, [id]: value }))}
          onClose={() => setPlayer(false)}
        />
      )}
      {assistant && (
        <AssistantPanel
          sessionId={comparison.id}
          ready={Boolean(
            config.capabilities.backboard && (!connection.configured || connection.signedIn),
          )}
          onClose={() => setAssistant(false)}
          onSync={sync}
        />
      )}
      {settings && (
        <Modal title="Workspace connections" onClose={() => setSettings(false)}>
          <div className="settings-content">
            <p>
              {config.liveReady
                ? 'Provider configuration is present. A successful live run is still needed to verify it.'
                : 'The example works without accounts or API credits. Live analysis needs the connections below.'}
            </p>
            <div className="connection-list">
              {sponsors.map(([name, purpose]) => (
                <div key={name}>
                  <div>
                    <strong>{name}</strong>
                    <span>{purpose}</span>
                  </div>
                  <span
                    className={
                      config.capabilities[name.toLowerCase()] ? 'status-ready' : 'status-off'
                    }
                  >
                    {name === 'Mastra'
                      ? 'Installed'
                      : config.capabilities[name.toLowerCase()]
                        ? 'Configured'
                        : 'Not connected'}
                  </span>
                </div>
              ))}
            </div>
            <p className="muted">
              Configure secrets in the server’s .env file, following docs/SETUP.md. Never enter API
              keys into this page. Live requests are disabled until explicitly enabled.
            </p>
            {config.blockers.length > 0 && (
              <ul className="blocker-list">
                {config.blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
            <p className="small">
              Local sessions stay in this browser. Cloud sync is explicit. Sponsor credentials and
              live service verification are still required before public launch.
            </p>
          </div>
        </Modal>
      )}
      {pendingDelete && (
        <Modal title="Delete saved session?" onClose={() => setPendingDelete(null)}>
          <div className="delete-content">
            <p>
              This removes the session and its progress from this device. If you’re signed in, its
              account copy will also be deleted.
            </p>
            <div className="dialog-actions">
              <button className="button quiet" onClick={() => setPendingDelete(null)}>
                Keep session
              </button>
              <button
                className="button primary"
                onClick={async () => {
                  try {
                    if (connection.signedIn)
                      await connection.request(
                        `/api/sessions/${pendingDelete}`,
                        undefined,
                        'DELETE',
                      );
                    const next = sessions.filter((s) => s.comparison.id !== pendingDelete);
                    writeSessions(next);
                    setSessions(next);
                    setPendingDelete(null);
                    setToast('Saved session deleted.');
                  } catch (e) {
                    setToast((e as Error).message);
                  }
                }}
              >
                Delete session
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
