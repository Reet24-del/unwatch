import { m, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

export function WorkspaceHero() {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 100, damping: 20 });
  const rotateY = useSpring(y, { stiffness: 100, damping: 20 });
  return (
    <header className="workspace-hero">
      <div className="hero-wave-glow" aria-hidden="true" />
      <div className="hero-copy">
        <h1>
          <span>Less replay.</span>
          <span>More progress.</span>
        </h1>
        <p>Find what the next tutorial actually adds.</p>
      </div>
      <m.div
        className="hero-art"
        aria-hidden="true"
        initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        onPointerMove={(event) => {
          if (reduceMotion || event.pointerType !== 'mouse') return;
          const bounds = event.currentTarget.getBoundingClientRect();
          y.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 12);
          x.set(-((event.clientY - bounds.top) / bounds.height - 0.5) * 10);
        }}
        onPointerLeave={() => {
          x.set(0);
          y.set(0);
        }}
      >
        <m.img
          src="/images/learning-wave.webp"
          width="1600"
          height="720"
          alt=""
          fetchPriority="high"
          decoding="async"
          style={reduceMotion ? undefined : { rotateX, rotateY }}
        />
      </m.div>
    </header>
  );
}
