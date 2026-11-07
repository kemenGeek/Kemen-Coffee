import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { AnimatePresence, motion, type PanInfo } from 'motion/react'
import { useEffect, useRef, type MouseEvent } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useScrollLock } from '../hooks/useScrollLock'
import { easePremium } from '../lib/motion'
import type { GalleryItem } from '../types'
import { Picture } from './Picture'

const SWIPE_DISTANCE_PX = 60

const controlClasses =
  'grid size-12 shrink-0 place-items-center rounded-full border border-cream/25 text-cream transition-colors duration-300 hover:bg-cream hover:text-espresso'

interface LightboxProps {
  items: GalleryItem[]
  index: number | null
  onChange: (index: number) => void
  onClose: () => void
}

export function Lightbox({ items, index, onChange, onClose }: LightboxProps) {
  useScrollLock(index !== null)

  return (
    <AnimatePresence>
      {index !== null && (
        <LightboxDialog items={items} index={index} onChange={onChange} onClose={onClose} />
      )}
    </AnimatePresence>
  )
}

function LightboxDialog({ items, index, onChange, onClose }: LightboxProps & { index: number }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const item = items[index]

  const showPrevious = () => onChange((index - 1 + items.length) % items.length)
  const showNext = () => onChange((index + 1) % items.length)

  useFocusTrap(dialogRef, onClose)

  const navigationRef = useRef({ showPrevious, showNext })

  useEffect(() => {
    navigationRef.current = { showPrevious, showNext }
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        navigationRef.current.showPrevious()
      } else if (event.key === 'ArrowRight') {
        navigationRef.current.showNext()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleDragEnd = (_event: PointerEvent, info: PanInfo) => {
    if (info.offset.x <= -SWIPE_DISTANCE_PX) {
      showNext()
    } else if (info.offset.x >= SWIPE_DISTANCE_PX) {
      showPrevious()
    }
  }

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Gallery image viewer"
      data-theme="dark"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: easePremium }}
      className="fixed inset-0 z-50 flex flex-col bg-charcoal/96 text-cream backdrop-blur-sm"
    >
      <div className="flex shrink-0 items-center justify-between px-5 py-4 md:px-8">
        <p aria-live="polite" className="eyebrow text-beige">
          {index + 1} / {items.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image viewer"
          className={controlClasses}
        >
          <X aria-hidden className="size-5" />
        </button>
      </div>

      <div
        onClick={handleBackdropClick}
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-24"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: easePremium }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={handleDragEnd}
            className="flex max-h-full max-w-full items-center justify-center"
          >
            <Picture
              photo={{ ...item.image, focus: undefined }}
              sizes="(min-width: 768px) 80vw, 92vw"
              priority
              draggable={false}
              className="max-h-[calc(100svh-13rem)] w-auto max-w-full rounded-xl object-contain"
            />
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={showPrevious}
          aria-label="Previous image"
          className={`${controlClasses} absolute left-6 hidden md:grid`}
        >
          <ChevronLeft aria-hidden className="size-5" />
        </button>
        <button
          type="button"
          onClick={showNext}
          aria-label="Next image"
          className={`${controlClasses} absolute right-6 hidden md:grid`}
        >
          <ChevronRight aria-hidden className="size-5" />
        </button>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 px-5 py-5 md:justify-center md:px-8 md:text-center">
        <button
          type="button"
          onClick={showPrevious}
          aria-label="Previous image"
          className={`${controlClasses} md:hidden`}
        >
          <ChevronLeft aria-hidden className="size-5" />
        </button>
        <div className="min-w-0 text-center">
          <p className="font-serif text-lg text-balance md:text-xl">{item.caption}</p>
          <p className="eyebrow mt-1 text-beige">{item.category}</p>
        </div>
        <button
          type="button"
          onClick={showNext}
          aria-label="Next image"
          className={`${controlClasses} md:hidden`}
        >
          <ChevronRight aria-hidden className="size-5" />
        </button>
      </div>
    </motion.div>
  )
}
