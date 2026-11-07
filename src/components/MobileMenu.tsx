import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRef, type MouseEvent } from 'react'
import { navLinks } from '../data/navigation'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useScrollLock } from '../hooks/useScrollLock'
import { cn } from '../lib/cn'
import { easePremium } from '../lib/motion'
import { scrollToSection } from '../lib/scrollToSection'
import { Wordmark } from './Wordmark'

interface MobileMenuProps {
  open: boolean
  activeId: string
  onClose: () => void
}

export function MobileMenu({ open, activeId, onClose }: MobileMenuProps) {
  useScrollLock(open)

  return (
    <AnimatePresence>
      {open && <MobileMenuDialog activeId={activeId} onClose={onClose} />}
    </AnimatePresence>
  )
}

function MobileMenuDialog({ activeId, onClose }: Omit<MobileMenuProps, 'open'>) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, onClose)

  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    onClose()
    window.requestAnimationFrame(() => scrollToSection(id))
  }

  return (
    <motion.div
      ref={dialogRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      data-theme="dark"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: easePremium }}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-espresso-deep text-cream"
    >
      <div className="container-x flex h-20 shrink-0 items-center justify-between">
        <Wordmark />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="-mr-2 grid size-12 place-items-center rounded-full transition-colors hover:bg-cream/10"
        >
          <X aria-hidden className="size-6" />
        </button>
      </div>

      <nav aria-label="Mobile" className="container-x flex flex-1 flex-col justify-center py-8">
        <ul>
          {navLinks.map(({ id, label }, index) => (
            <motion.li
              key={id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 + index * 0.06, ease: easePremium }}
              className="border-b border-cream/15"
            >
              <a
                href={`#${id}`}
                onClick={(event) => navigate(event, id)}
                aria-current={activeId === id ? 'true' : undefined}
                className={cn(
                  'flex items-center justify-between py-4 font-serif text-[clamp(2.25rem,10vw,3.25rem)] leading-tight font-light transition-colors',
                  activeId === id ? 'text-beige italic' : 'text-cream hover:text-beige',
                )}
              >
                {label}
                <span className="eyebrow text-cream/60 not-italic">0{index + 1}</span>
              </a>
            </motion.li>
          ))}
        </ul>
      </nav>

      <div className="container-x shrink-0 pb-8">
        <a
          href="#menu"
          onClick={(event) => navigate(event, 'menu')}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-cream text-sm font-semibold tracking-wide text-espresso transition-colors hover:bg-white"
        >
          Explore Menu
        </a>
      </div>
    </motion.div>
  )
}
