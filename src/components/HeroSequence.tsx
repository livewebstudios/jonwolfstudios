import { useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface Props {
  /** relative prefix back to site root, e.g. './' on home */
  root: string;
}

const EYEBROW = 'NORTH JERSEY · MUSICIAN · BUILDER';

/**
 * Home hero — the one orchestrated entrance on the site.
 * Eyebrow types in, headline lines rise blur-to-sharp, sub + CTAs settle.
 * Total ≤ 1.6s, plays once per session.
 */
export default function HeroSequence({ root }: Props) {
  const reduced = useReducedMotion();

  const played = useMemo(
    () => typeof window !== 'undefined' && sessionStorage.getItem('heroPlayed') === '1',
    []
  );
  const skip = Boolean(reduced) || played;

  useEffect(() => {
    try {
      sessionStorage.setItem('heroPlayed', '1');
    } catch {
      /* private mode — animation just replays */
    }
  }, []);

  const ease = [0.22, 1, 0.36, 1] as const;

  const line = {
    hidden: skip
      ? { opacity: 1, y: 0, filter: 'blur(0px)' }
      : { opacity: 0, y: 26, filter: 'blur(8px)' },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: skip ? { duration: 0 } : { duration: 0.65, ease, delay: 0.45 + i * 0.14 },
    }),
  };

  return (
    <div className="hero__inner">
      <p className="kicker hero__kicker" aria-label={EYEBROW}>
        <span aria-hidden="true" style={{ display: 'flex', flexWrap: 'wrap', columnGap: '0.55em' }}>
          {EYEBROW.split(' ').map((word, w, words) => {
            const offset = words.slice(0, w).reduce((n, prev) => n + prev.length, 0);
            return (
              <span key={w} style={{ whiteSpace: 'nowrap' }}>
                {word.split('').map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={skip ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={skip ? { duration: 0 } : { duration: 0.02, delay: 0.2 + (offset + i) * 0.014 }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
            );
          })}
        </span>
      </p>

      <h1 className="hero__title">
        <motion.span className="hero__line" variants={line} custom={0} initial="hidden" animate="show">
          Jon Wolf —
        </motion.span>
        <motion.span
          className="hero__line hero__line--music"
          variants={line}
          custom={1}
          initial="hidden"
          animate="show"
        >
          keys on stage,
        </motion.span>
        <motion.span
          className="hero__line hero__line--web"
          variants={line}
          custom={2}
          initial="hidden"
          animate="show"
        >
          code off it.
        </motion.span>
      </h1>

      <motion.p className="lede hero__lede" variants={line} custom={3} initial="hidden" animate="show">
        Performing keyboardist &amp; guitarist with The British Invasion Years. Owner of Live Web
        Studios since 2004. Now building AI workflows for businesses that want in.
      </motion.p>

      <motion.div className="hero__ctas" variants={line} custom={4} initial="hidden" animate="show">
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
