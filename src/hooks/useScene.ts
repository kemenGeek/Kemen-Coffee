import { createContext, useContext } from 'react'
import type { SceneId } from '../data/scenes'

export interface SceneSelection {
  id: SceneId
  /** Counts every change of scene, so each transition has its own identity. */
  count: number
  /** A click clears the page for the flight. Scrolling keeps the page in place while it reads. */
  via: 'load' | 'click' | 'scroll'
}

interface SceneContextValue {
  selection: SceneSelection
  /** The section a click is travelling to, until the page finishes scrolling there. */
  navigatingTo: SceneId | null
  selectScene: (id: SceneId) => void
}

export const SceneContext = createContext<SceneContextValue | null>(null)

export function useScene() {
  const scene = useContext(SceneContext)

  if (!scene) {
    throw new Error('useScene must be used inside SceneProvider.')
  }

  return scene
}
