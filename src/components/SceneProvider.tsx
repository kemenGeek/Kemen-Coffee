import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DEFAULT_SCENE_ID, isSceneId, type SceneId } from '../data/scenes'
import { SceneContext, type SceneSelection } from '../hooks/useScene'

const SCROLL_SETTLED_MS = 200

/** Scenes change only when someone navigates. Nothing here listens to scroll position. */
export function SceneProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<SceneSelection>({ id: DEFAULT_SCENE_ID, count: 0 })
  const [navigatingTo, setNavigatingTo] = useState<SceneId | null>(null)
  const settleTimerRef = useRef<number | undefined>(undefined)

  const waitForScrollToSettle = useCallback(() => {
    window.clearTimeout(settleTimerRef.current)
    settleTimerRef.current = window.setTimeout(() => setNavigatingTo(null), SCROLL_SETTLED_MS)
  }, [])

  const selectScene = useCallback(
    (id: SceneId) => {
      setSelection((current) => (current.id === id ? current : { id, count: current.count + 1 }))
      setNavigatingTo(id)
      waitForScrollToSettle()
    },
    [waitForScrollToSettle],
  )

  // Handling links here covers the navbar, the mobile menu, and every other link to a section.
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null
      const id = link?.getAttribute('href')?.slice(1)

      if (id && isSceneId(id)) {
        selectScene(id)
      }
    }

    // Browser back and forward buttons navigate between sections without a click on the page.
    const handleHashChange = () => {
      const id = window.location.hash.slice(1)

      if (isSceneId(id)) {
        selectScene(id)
      }
    }

    document.addEventListener('click', handleClick)
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      document.removeEventListener('click', handleClick)
      window.removeEventListener('hashchange', handleHashChange)
      window.clearTimeout(settleTimerRef.current)
    }
  }, [selectScene])

  useEffect(() => {
    if (!navigatingTo) {
      return
    }

    window.addEventListener('scroll', waitForScrollToSettle, { passive: true })

    return () => window.removeEventListener('scroll', waitForScrollToSettle)
  }, [navigatingTo, waitForScrollToSettle])

  const value = useMemo(
    () => ({ selection, navigatingTo, selectScene }),
    [selection, navigatingTo, selectScene],
  )

  return <SceneContext value={value}>{children}</SceneContext>
}
