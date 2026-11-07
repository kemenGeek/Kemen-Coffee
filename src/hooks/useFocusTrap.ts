import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input, textarea, select'

export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, onEscape: () => void) {
  const onEscapeRef = useRef(onEscape)

  useEffect(() => {
    onEscapeRef.current = onEscape
  })

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const previouslyFocused = document.activeElement as HTMLElement | null
    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => element.getClientRects().length > 0,
      )

    getFocusable()[0]?.focus({ preventScroll: true })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onEscapeRef.current()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusable = getFocusable()
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const focused = document.activeElement

      if (!container.contains(focused) || (!event.shiftKey && focused === last)) {
        event.preventDefault()
        first?.focus()
      } else if (event.shiftKey && focused === first) {
        event.preventDefault()
        last?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus({ preventScroll: true })
    }
  }, [containerRef])
}
