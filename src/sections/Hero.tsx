import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { LinkButton } from '../components/LinkButton'
import { Stamp } from '../components/Stamp'
import { easePremium } from '../lib/motion'

const HEADLINE_LINES: ReactNode[] = [
  'Every Cup',
  <>
    Tells a <em className="font-normal italic">Story.</em>
  </>,
]

export function Hero() {
  return (
    <section
      id="home"
      data-theme="dark"
      aria-label="Welcome to KEMEN COFFEE"
      className="relative isolate flex h-svh min-h-[40rem] items-end overflow-hidden text-cream"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-espresso-deep from-30% via-espresso-deep/80 via-60% to-espresso-deep/15 lg:bg-gradient-to-r lg:from-espresso-deep/95 lg:from-0% lg:via-espresso-deep/60 lg:via-50% lg:to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-gradient-to-t from-espresso-deep/75 to-transparent"
      />

      <div className="container-x pt-32 pb-28 md:pb-32">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: easePremium }}
          className="eyebrow text-beige [text-shadow:0_0_14px_rgb(36_20_15/0.9)]"
        >
          <span className="block sm:inline">Brewed with Passion. </span>
          <span className="block sm:inline">Served with Purpose.</span>
        </motion.p>

        <h1 className="mt-6 font-serif text-[clamp(3.1rem,10.4vw,9.25rem)] leading-[1] font-light tracking-[-0.025em]">
          {HEADLINE_LINES.map((line, index) => (
            <span key={index} className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
              <motion.span
                initial={{ y: '112%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.15, delay: 0.3 + index * 0.14, ease: easePremium }}
                className="block"
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.75, ease: easePremium }}
        >
          <p className="mt-7 max-w-xl text-[1.05rem] leading-relaxed text-pretty text-cream/90 md:text-lg">
            Discover the perfect balance of rich flavors, warm moments, and exceptional coffee at
            KEMEN COFFEE.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="#menu" showArrow>
              Explore Our Menu
            </LinkButton>
            <LinkButton href="#about" variant="outline">
              Discover Our Story
            </LinkButton>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.1 }}
        className="absolute right-14 bottom-24 hidden text-cream/85 lg:block"
      >
        <Stamp />
      </motion.div>

      <motion.a
        href="#about"
        aria-label="Scroll to the About section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.3 }}
        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2.5 py-1 text-cream/85 transition-colors hover:text-cream"
      >
        <span className="eyebrow !text-[0.6rem]">Scroll</span>
        <span aria-hidden className="relative block h-10 w-px bg-cream/25">
          <span className="absolute inset-0 animate-scroll-cue bg-cream" />
        </span>
      </motion.a>
    </section>
  )
}
