import { drinks } from '../data/menu'
import type { SceneId } from '../data/scenes'

/**
 * State shared by everything inside the canvas. It changes every frame, so it lives outside React:
 * nothing here should cause a render.
 */
export const rig = {
  /** Where GSAP says the camera should be, as a fraction of the path. */
  target: 0,
  /** Where the camera is. It chases target, which keeps motion smooth through any interruption. */
  position: 0,
  /** Path fractions per second, signed. */
  velocity: 0,
  station: 'home' as SceneId,
  arrived: false,
  /** A count of arrivals, so a sequence can tell a fresh arrival from the last one. */
  arrivals: 0,
  pointer: { x: 0, y: 0 },
  drinkId: drinks[0].id,
  /** Turntable angles the visitor has dragged to. */
  inspect: { yaw: 0, pitch: 0 },
  dragging: false,
}

/** 0 at rest, 1 at full travelling speed. */
export function travelAmount() {
  return Math.min(Math.abs(rig.velocity) / 0.2, 1)
}
