import { useEffect, useState } from 'react';
import { useMotionValueEvent, useReducedMotion, useSpring } from 'motion/react';

export function AnimatedNumber({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const number = useSpring(value, { stiffness: 160, damping: 26 });
  const [display, setDisplay] = useState(value);
  useMotionValueEvent(number, 'change', (latest) => setDisplay(Math.round(latest)));
  useEffect(() => {
    number.set(value);
  }, [number, value]);
  return (
    <>
      <span aria-hidden="true">{reduceMotion ? value : display}</span>
      <span className="sr-only">{value}</span>
    </>
  );
}
