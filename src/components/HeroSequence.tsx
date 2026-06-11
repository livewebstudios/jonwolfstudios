import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Props {
  /** relative prefix back to site root, e.g. './' on home */
  root: string;
}

const EYEBROW = 'NORTH JERSEY · MUSICIAN · BUILDER';

/**
 * Home hero entrance. On a fresh session it waits for the header signature to
 * finish drawing (the `signature:done` broadcast), then the eyebrow types in
 * and the headline lines rise blur-to-sharp. On later navigations (or reduced
 * motion / no-JS) it's simply shown.
 *
 * The wrapper starts at opacity 0 (CSS); a <noscript> override keeps it visible
 * without JS so the content is never hidden for crawlers or no-script visitors.
 */
export default function HeroSequence({ root }: Props) {
  const [phase, setPhase] = useState<'hidden' | 'playing' | 'shown'>('hidden');

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let played = false;
    try {
      played = sessionStorage.getItem('heroPlayed') === '1';
    } catch {
      /* private mode */
    }

    if (reduced || played) {
      setPhase('shown');
      return;
    }

    try {
      sessionStorage.setItem('heroPlayed', '1');
    } catch {
      /* private mode */
    }

    let timer = 0;
    const start = () => {
      window.clearTimeout(timer);
      window.removeEventListener('signature:done', start);
      setPhase('playing');
    };

    if ((window as { __signatureDone?: boolean }).__signatureDone) {
      timer = window.setTimeout(start, 160); // tiny beat after the ink dries
    } else {
      window.addEventListener('signature:done', start, { once: true });
      timer = window.setTimeout(start, 5200); // fallback if the event never fires
    }

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('signature:done', start);
    };
  }, []);

  const ease = [0.22, 1, 0.36, 1] as const;

  const lineAnim = (i: number) =>
    phase === 'playing'
      ? {
          opacity: [0, 1],
          y: [22, 0],
          filter: ['blur(6px)', 'blur(0px)'],
          transition: { duration: 0.6, ease, delay: i * 0.12 },
        }
      : {};

  return (
    <div className="hero__inner" style={{ opacity: phase === 'hidden' ? 0 : 1 }}>
      <p className="kicker hero__kicker" aria-label={EYEBROW}>
        <span aria-hidden="true" style={{ display: 'flex', flexWrap: 'wrap', columnGap: '0.55em' }}>
          {EYEBROW.split(' ').map((word, w, words) => {
            const offset = words.slice(0, w).reduce((n, prev) => n + prev.length, 0);
            return (
              <span key={w} style={{ whiteSpace: 'nowrap' }}>
                {word.split('').map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={false}
                    animate={
                      phase === 'playing'
                        ? { opacity: [0, 1], transition: { duration: 0.02, delay: 0.1 + (offset + i) * 0.014 } }
                        : {}
                    }
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
            );
          })}
        </span>
      </p>

      <h1 className="hero__title hero__title--tagline">
        <motion.span className="hero__line" initial={false} animate={lineAnim(0)}>
          By day, <span className="hl-web">WEBSITES</span>.
        </motion.span>
        <motion.span className="hero__line" initial={false} animate={lineAnim(1)}>
          By night, <span className="hl-music">SETLISTS</span>.
        </motion.span>
      </h1>

      <motion.p className="lede hero__lede" initial={false} animate={lineAnim(2)}>
        Performing keyboardist &amp; guitarist with The British Invasion Years. Owner of Live Web
        Studios since 2004. Now building AI workflows for businesses that want in.
      </motion.p>

      <motion.div className="hero__ctas" initial={false} animate={lineAnim(3)}>
        <a className="btn" href={root + 'music/'}>
          The Stage
        </a>
        <a className="btn btn--ghost" href={root + 'web-ai/'}>
          The Studio
        </a>
      </motion.div>
    </div>
  );
}
