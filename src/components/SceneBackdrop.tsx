import { motion } from 'motion/react'
import { Component, lazy, Suspense, useCallback, useState, type ReactNode } from 'react'
import { canRenderWorld } from '../world/quality'
import { SceneBackground } from './SceneBackground'

const WorldCanvas = lazy(() => import('../world/WorldCanvas'))

const WORLD_FADE_SECONDS = 1.4

class WorldBoundary extends Component<{ onFail: () => void; children: ReactNode }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onFail()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * The live 3D world where the device can render it. Otherwise, for visitors who prefer reduced
 * motion, or if anything goes wrong, the page keeps its photographic scenes and loses nothing.
 */
export function SceneBackdrop() {
  const [worldAllowed, setWorldAllowed] = useState(canRenderWorld)
  const [worldReady, setWorldReady] = useState(false)
  const handleReady = useCallback(() => setWorldReady(true), [])
  const handleFail = useCallback(() => setWorldAllowed(false), [])

  return (
    <>
      {!(worldAllowed && worldReady) && <SceneBackground stillsOnly={worldAllowed} />}
      {worldAllowed && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: worldReady ? 1 : 0 }}
          transition={{ duration: WORLD_FADE_SECONDS, ease: 'easeInOut' }}
          className="fixed inset-x-0 top-0 -z-10 h-lvh"
        >
          <WorldBoundary onFail={handleFail}>
            <Suspense fallback={null}>
              <WorldCanvas onReady={handleReady} onLost={handleFail} />
            </Suspense>
          </WorldBoundary>
        </motion.div>
      )}
    </>
  )
}
