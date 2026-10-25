import { ArrowDown, ArrowRight, ArrowUpRight, FastForward } from 'lucide-react';
import { m } from 'motion/react';
import './landing.css';

const steps = [
  ['Paste two links.', 'The tutorial you’ve watched, and the one you’re considering.'],
  ['Check the evidence.', 'Review timestamped suggestions. Restore anything you want to watch.'],
  ['Watch your selection.', 'Play the original videos in a watchlist you control.'],
];

/** A code-native product illustration, deliberately distinct from a live result. */
function ProductPreview() {
  return (
    <div
      className="landing-laptop"
      role="img"
      aria-label="Illustrative UNWATCH preview showing two tutorial timelines and a selected watchlist"
    >
      <div className="laptop-display">
        <div className="laptop-camera" />
        <div className="preview-ui">
          <div className="preview-top">
            <span>
              <FastForward size={16} fill="currentColor" strokeWidth={0} /> UNWATCH
            </span>
            <small>Illustrative preview</small>
          </div>
          <div className="preview-heading">
            Your next <em>12 minutes.</em>
          </div>
          <div className="preview-videos">
            <div>
              <span className="preview-letter">A</span>
              <p>
                <small>ALREADY WATCHED</small>
                <strong>React fundamentals</strong>
                <span>Components, props & state</span>
              </p>
            </div>
            <div>
              <span className="preview-letter letter-b">B</span>
              <p>
                <small>UP NEXT</small>
                <strong>Build your first React app</strong>
                <span>From the basics to a working app</span>
              </p>
            </div>
          </div>
          <div className="preview-tracks">
            <div>
              <b>A</b>
              <span className="preview-track">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>
            <div>
              <b>B</b>
              <span className="preview-track">
                <i />
                <i />
                <i className="new" />
                <i />
                <i className="new" />
                <i className="new" />
                <i />
                <i className="new" />
                <i />
              </span>
            </div>
            <p>
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
            </p>
          </div>
          <div className="preview-legend">
            <span>● Familiar ground</span>
            <span>● Something new</span>
          </div>
          <div className="preview-list-title">A watchlist you choose.</div>
          {[
            'Setting up the project',
            'Putting state into practice',
            'A different way to handle events',
          ].map((text, index) => (
            <div className="preview-row" key={text}>
              <span>0{index * 3 + 2}:14</span>
              <strong>{text}</strong>
              <span className="preview-tick">✓</span>
            </div>
          ))}
          <span className="preview-watch">
            Watch selected <ArrowRight size={16} />
          </span>
        </div>
      </div>
      <div className="laptop-base">
        <div className="laptop-keyboard" />
        <div className="laptop-trackpad" />
      </div>
      <div className="laptop-lip" />
    </div>
  );
}

export default function Landing() {
  return (
    <div className="landing">
      <a className="landing-skip" href="#landing-content">
        Skip to content
      </a>
      <section className="landing-opening">
        <header className="landing-header">
          <a className="landing-brand" href="/" aria-label="UNWATCH home">
            <FastForward fill="currentColor" strokeWidth={0} />
            <span>UNWATCH</span>
          </a>
          <nav aria-label="Landing navigation">
            <a href="#how-it-works">How it works</a>
            <a href="/workspace">
              Open workspace <ArrowUpRight size={16} />
            </a>
          </nav>
        </header>
        <main id="landing-content" className="landing-hero">
          <m.div
            className="landing-copy"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1>
              Skip the replay.
              <br />
              Keep the discovery.
            </h1>
            <p>
              Compare two YouTube tutorials. Find what’s new, review the evidence, and watch the
              parts you choose.
            </p>
            <div className="landing-actions">
              <a className="landing-primary" href="/workspace">
                Open workspace <ArrowRight size={22} />
              </a>
              <a className="landing-walkthrough" href="/demo/index.html">
                Watch the walkthrough
              </a>
            </div>
          </m.div>
          <div className="landing-scene">
            <img
              className="landing-sculpture"
              src="/images/orange-ribbon.webp"
              alt=""
              fetchPriority="high"
              width="1536"
              height="1024"
            />
            <ProductPreview />
          </div>
          <a className="landing-seam" href="#how-it-works">
            <span>01 / LESS REPLAY, MORE PROGRESS</span>
            <ArrowDown size={17} />
          </a>
        </main>
      </section>
      <section className="landing-process" id="how-it-works" aria-labelledby="process-title">
        <div className="process-intro">
          <div>
            <p className="process-label">HOW IT WORKS</p>
            <h2 id="process-title">
              A second tutorial.
              <br />A shorter watchlist.
            </h2>
          </div>
          <p>
            You already learned the basics. UNWATCH helps you find what another explanation adds.
          </p>
        </div>
        <ol className="process-steps">
          {steps.map(([title, description], i) => (
            <li key={title}>
              <span className="step-number">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>
      <footer className="landing-footer">
        <div className="landing-last-call">
          <h2>
            Your time.
            <br className="landing-mobile-break" /> Better spent.
          </h2>
          <a className="landing-primary" href="/workspace">
            Open workspace <ArrowUpRight size={20} />
          </a>
        </div>
        <div className="landing-colophon">
          <a className="landing-brand" href="/">
            UNWATCH
          </a>
          <p>Suggestions use speech and can miss visual details. You choose what to watch.</p>
          <nav aria-label="Project links">
            <a href="https://github.com/Reet24-del/unwatch">Source code</a>
            <a href="/demo/index.html">Walkthrough</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
