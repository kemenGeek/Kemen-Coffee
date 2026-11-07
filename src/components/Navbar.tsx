import { Menu } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { navLinks } from '../data/navigation'
import { useActiveSection } from '../hooks/useActiveSection'
import { useScene } from '../hooks/useScene'
import { useScrollPast } from '../hooks/useScrollPast'
import { cn } from '../lib/cn'
import { LinkButton } from './LinkButton'
import { MobileMenu } from './MobileMenu'
import { Wordmark } from './Wordmark'

const SECTION_IDS = navLinks.map(({ id }) => id)
const SOLID_AFTER_PX = 32

export function Navbar() {
  const solid = useScrollPast(SOLID_AFTER_PX)
  const scrolledToId = useActiveSection(SECTION_IDS)
  const { navigatingTo } = useScene()
  const activeId = navigatingTo ?? scrolledToId
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header
        data-theme={solid ? undefined : 'dark'}
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-colors duration-500 ease-premium',
          solid
            ? 'bg-cream-light/92 text-espresso shadow-[0_1px_0_rgb(59_36_28/0.1)] backdrop-blur-md'
            : 'bg-transparent text-cream',
        )}
      >
        <nav aria-label="Primary" className="container-x flex h-20 items-center justify-between">
          <a
            id="brand-link"
            href="#home"
            aria-label="KEMEN COFFEE home"
            className="inline-flex min-h-11 items-center"
          >
            <Wordmark />
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map(({ id, label }) => {
              const active = activeId === id

              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'relative block px-4 py-2.5 text-sm font-medium tracking-wide transition-opacity duration-300',
                      !active && 'opacity-80 hover:opacity-100',
                    )}
                  >
                    {label}
                    {active && (
                      <motion.span
                        layoutId="nav-indicator"
                        aria-hidden
                        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
                        className="absolute inset-x-4 bottom-1 h-px bg-current"
                      />
                    )}
                  </a>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-2">
            <span className="hidden sm:block">
              <LinkButton
                href="#menu"
                variant={solid ? 'espresso' : 'outline'}
                className="!h-11 !px-6"
              >
                Explore Menu
              </LinkButton>
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="-mr-2 grid size-12 place-items-center rounded-full transition-colors hover:bg-current/10 lg:hidden"
            >
              <Menu aria-hidden className="size-6" />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu open={menuOpen} activeId={activeId} onClose={() => setMenuOpen(false)} />
    </>
  )
}
