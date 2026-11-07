import { ArrowUp } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useScrollPast } from '../hooks/useScrollPast'
import { easePremium } from '../lib/motion'

const SHOW_AFTER_PX = 720

export function BackToTop() {
  const visible = useScrollPast(SHOW_AFTER_PX)

  const handleClick = () => {
    window.scrollTo({ top: 0 })
    document.getElementById('brand-link')?.focus({ preventScroll: true })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleClick}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.4, ease: easePremium }}
          className="fixed right-5 bottom-5 z-30 grid size-12 place-items-center rounded-full bg-espresso text-cream shadow-lift transition-colors duration-300 hover:bg-coffee md:right-8 md:bottom-8"
        >
          <ArrowUp aria-hidden className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
