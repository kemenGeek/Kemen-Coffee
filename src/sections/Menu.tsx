import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { MenuStage } from '../components/MenuStage'
import { ProductCard } from '../components/ProductCard'
import { Reveal } from '../components/Reveal'
import { drinks, menuFilters } from '../data/menu'
import { cn } from '../lib/cn'
import { easePremium } from '../lib/motion'
import type { MenuFilter } from '../types'

export function Menu() {
  const [activeFilter, setActiveFilter] = useState<MenuFilter>('all')
  const visibleDrinks =
    activeFilter === 'all' ? drinks : drinks.filter(({ category }) => category === activeFilter)

  return (
    <section id="menu" aria-labelledby="menu-heading">
      <MenuStage />
      <div className="section-pad rounded-t-[2rem] md:rounded-t-[3rem] bg-cream/(--section-veil)">
      <div className="container-x">
        <div className="flex justify-start lg:justify-end">
          <Reveal delay={0.1}>
            <div
              role="group"
              aria-label="Filter drinks by category"
              className="flex flex-wrap gap-1.5"
            >
              {menuFilters.map(({ value, label }) => {
                const active = activeFilter === value

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setActiveFilter(value)}
                    className={cn(
                      'relative isolate h-11 min-w-11 rounded-full px-3.5 text-[0.8rem] font-semibold transition-colors duration-300 sm:px-5 sm:text-sm',
                      active ? 'text-cream' : 'text-espresso hover:bg-espresso/8',
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="menu-filter-pill"
                        aria-hidden
                        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                        className="absolute inset-0 -z-10 rounded-full bg-espresso"
                      />
                    )}
                    {label}
                  </button>
                )
              })}
            </div>
          </Reveal>
        </div>

        <p aria-live="polite" className="sr-only">
          Showing {visibleDrinks.length} {visibleDrinks.length === 1 ? 'drink' : 'drinks'}
        </p>

        <Reveal delay={0.15}>
          <motion.ul
            layout
            className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleDrinks.map((drink) => (
                <motion.li
                  key={drink.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.5, ease: easePremium }}
                >
                  <ProductCard drink={drink} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </Reveal>

        <p className="mt-16 text-sm text-coffee">
          Sample menu and prices, shown for demonstration. Online ordering is not available.
        </p>
      </div>
      </div>
    </section>
  )
}
