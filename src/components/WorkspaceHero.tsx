import { useReducedMotion } from 'motion/react';

/** A quiet signal motif, echoing the two tutorial tracks below. */
function LearningSignal() {
  return (
    <svg viewBox="0 0 600 180" fill="none" aria-hidden="true" className="learning-signal">
      <defs>
        <linearGradient
          id="signal-cyan"
          x1="0"
          y1="90"
          x2="600"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#77b5bf" stopOpacity="0" />
          <stop offset=".45" stopColor="#77b5bf" stopOpacity=".75" />
          <stop offset="1" stopColor="#77b5bf" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="signal-violet"
          x1="0"
          y1="90"
          x2="600"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#a08cae" stopOpacity="0" />
          <stop offset=".6" stopColor="#a08cae" stopOpacity=".65" />
          <stop offset="1" stopColor="#a08cae" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        className="signal-trace trace-one"
        d="M0 100C65 100 65 62 125 62S205 130 265 130 345 48 405 48 485 110 545 110H600"
        stroke="url(#signal-cyan)"
        strokeWidth="1.4"
      />
      <path
        className="signal-trace trace-two"
        d="M0 110C65 110 85 125 145 125S225 48 285 48 365 112 425 112 505 72 565 72H600"
        stroke="url(#signal-violet)"
        strokeWidth="1.2"
      />
      <path
        d="M0 115C65 115 95 82 155 82S245 110 305 110 385 72 445 72 515 100 575 100H600"
        stroke="url(#signal-cyan)"
        strokeOpacity=".3"
      />
    </svg>
  );
}

export function WorkspaceHero() {
  const reduceMotion = useReducedMotion();
  return (
    <header className={`workspace-hero${reduceMotion ? ' motion-reduced' : ''}`}>
      <div className="hero-copy">
        <h1>
          <span>Less replay.</span> <span>More progress.</span>
        </h1>
        <p>Find what the next tutorial actually adds.</p>
      </div>
      <LearningSignal />
    </header>
  );
}
