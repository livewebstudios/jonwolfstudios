import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Props {
  /** relative prefix back to site root, e.g. './' on home */
  root: string;
}

const EYEBROW = 'NORTH JERSEY · MUSICIAN · BUILDER';

/**
 * Home hero — the one orchestrated entrance on the site.
 * Eyebrow types in, headline lines rise blur-to-sharp, sub + CTAs settle.
 * Total ≤ 1.6s, plays once per session.
 *
 * Hydration-safe: SSR markup is fully visible with no motion styles
 * (initial={false}); the entrance is driven by keyframes after mount,
 * so server and client HTML always match and no-JS visitors see content.
 */
export default function HeroSequence({ root }: Props) {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let played = false;
    try {
      played = sessionStorage.getItem('heroPlayed') === '1';
      sessionStorage.setItem('heroPlayed', '1');
    } catch {
      /* private mode — animation just replays */
    }
    if (!reduced && !played) setPlay(true);
  }, []);

  const ease = [0.22, 1, 0.36, 1] as const;

  const lineAnim = (i: number) =>
    play
      ? {
          opacity: [0, 1],
          y: [26, 0],
          filter: ['blur(8px)', 'blur(0px)'],
          transition: { duration: 0.65, ease, delay: 0.45 + i * 0.14 },
        }
      : {};

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
                    initial={false}
                    animate={
                      play
                        ? { opacity: [0, 1], transition: { duration: 0.02, delay: 0.2 + (offset + i) * 0.014 } }
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

      <h1 className="hero__title">
        <motion.span className="hero__line" initial={false} animate={lineAnim(0)}>
          Jon Wolf —
        </motion.span>
        <motion.span className="hero__line hero__line--music" initial={false} animate={lineAnim(1)}>
          keys on stage,
        </motion.span>
        <motion.span className="hero__line hero__line--web" initial={false} animate={lineAnim(2)}>
          code off it.
        </motion.span>
      </h1>

      <motion.p className="lede hero__lede" initial={false} animate={lineAnim(3)}>
        Performing keyboardist &amp; guitarist with The British Invasion Years. Owner of Live Web
        Studios since 2004. Now building AI workflows for businesses that want in.
      </motion.p>

      <motion.div className="hero__ctas" initial={false} animate={lineAnim(4)}>
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
