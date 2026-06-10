import { motion, useReducedMotion } from 'motion/react';

interface Props {
  /** relative prefix back to site root, e.g. './' on home */
  root: string;
}

/**
 * Home hero — the one orchestrated entrance on the site.
 * A follow-spot warms up, then the name steps into it.
 */
export default function HeroSequence({ root }: Props) {
  const reduced = useReducedMotion();

  const ease = [0.22, 1, 0.36, 1] as const;

  const line = {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reduced ? { duration: 0 } : { duration: 0.9, ease, delay: 0.35 + i * 0.18 },
    }),
  };

  return (
    <div className="hero__inner">
      {/* The spotlight beam warms up first */}
      <motion.div
        className="hero__beam"
        aria-hidden="true"
        initial={reduced ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0 : 2.2, ease: 'easeOut' }}
      />

      <motion.p className="kicker hero__kicker" variants={line} custom={0} initial="hidden" animate="show">
        NORTH JERSEY · MUSICIAN · BUILDER
      </motion.p>

      <h1 className="hero__title">
        <motion.span className="hero__line" variants={line} custom={1} initial="hidden" animate="show">
          Jon Wolf —
        </motion.span>
        <motion.span
          className="hero__line hero__line--music"
          variants={line}
          custom={2}
          initial="hidden"
          animate="show"
        >
          keys on stage,
        </motion.span>
        <motion.span
          className="hero__line hero__line--web"
          variants={line}
          custom={3}
          initial="hidden"
          animate="show"
        >
          code off it.
        </motion.span>
      </h1>

      <motion.p className="lede hero__lede" variants={line} custom={4} initial="hidden" animate="show">
        Performing keyboardist &amp; guitarist with The British Invasion Years. Owner of Live Web
        Studios since 2004. Now building AI workflows for businesses that want in.
      </motion.p>

      <motion.div className="hero__ctas" variants={line} custom={5} initial="hidden" animate="show">
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
