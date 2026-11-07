import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type ToastMessage } from '../hooks/useToast'
import { easePremium } from '../lib/motion'

const TOAST_DURATION_MS = 8000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastMessage & { id: number }) | null>(null)
  const timerRef = useRef<number | undefined>(undefined)

  const dismiss = useCallback(() => {
    window.clearTimeout(timerRef.current)
    setToast(null)
  }, [])

  const showToast = useCallback((message: ToastMessage) => {
    window.clearTimeout(timerRef.current)
    setToast({ ...message, id: Date.now() })
    timerRef.current = window.setTimeout(() => setToast(null), TOAST_DURATION_MS)
  }, [])

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  return (
    <ToastContext value={showToast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        data-theme="dark"
        className="pointer-events-none fixed inset-x-0 bottom-22 z-[55] flex justify-center px-4 sm:bottom-6"
      >
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.45, ease: easePremium }}
              className="pointer-events-auto flex w-full max-w-md items-start gap-4 rounded-2xl bg-espresso p-5 text-cream shadow-lift"
            >
              <div className="min-w-0 flex-1">
                <p className="font-serif text-lg">{toast.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-cream/80">{toast.description}</p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss notification"
                className="grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-cream/15"
              >
                <X aria-hidden className="size-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext>
  )
}
