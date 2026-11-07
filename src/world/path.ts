import { CatmullRomCurve3, Vector3 } from 'three'
import type { SceneId } from '../data/scenes'

type Vec = [number, number, number]

/**
 * One unbroken flight through the coffee house. Every navigation link is a stretch of this path,
 * so any journey passes through the rooms in between, and reversing or interrupting one is only
 * a change of direction along the same line.
 */
const keys: { at: Vec; look: Vec; mark?: `${SceneId}:${'from' | 'to'}` }[] = [
  { at: [1.1, 1.5, 2.6], look: [0, 1.1, 0] },
  { at: [0.3, 1.21, 0.5], look: [0, 1.105, 0], mark: 'home:from' },
  { at: [0.17, 1.17, 0.4], look: [0, 1.105, 0], mark: 'home:to' },
  { at: [-0.5, 1.95, -0.9], look: [0.2, 1.2, -6] },
  { at: [-0.1, 1.75, -3], look: [-1.2, 1.3, -8] },
  { at: [-1.5, 1.5, -5], look: [-3.6, 1.05, -7.4], mark: 'about:from' },
  { at: [-0.9, 1.45, -8.6], look: [-4.2, 1.1, -11.4], mark: 'about:to' },
  { at: [0.9, 1.5, -11.6], look: [4.1, 1.25, -14.4] },
  { at: [2.72, 1.42, -14.3], look: [4.24, 1.29, -14.72], mark: 'menu:from' },
  { at: [3.02, 1.33, -16.0], look: [3.95, 1.235, -16.5], mark: 'menu:to' },
  { at: [1.5, 1.6, -18], look: [0, 1.5, -22] },
  { at: [0, 1.62, -20.2], look: [0.4, 1.5, -24] },
  { at: [1.05, 1.52, -22.4], look: [-2.8, 1.5, -23.6], mark: 'gallery:from' },
  { at: [-0.95, 1.52, -26.4], look: [2.8, 1.5, -27.6], mark: 'gallery:to' },
  { at: [0.2, 1.62, -30.4], look: [0, 1.3, -36] },
  { at: [0, 1.55, -32.4], look: [0.3, 1, -38] },
  { at: [-2.4, 1.3, -35.2], look: [0.6, 0.85, -39.2], mark: 'contact:from' },
  { at: [-1, 1.2, -35.6], look: [0.4, 0.85, -39.6], mark: 'contact:to' },
]

const LENGTH_DIVISIONS = 2000

export const cameraCurve = new CatmullRomCurve3(
  keys.map(({ at }) => new Vector3(...at)),
  false,
  'centripetal',
)
export const lookCurve = new CatmullRomCurve3(
  keys.map(({ look }) => new Vector3(...look)),
  false,
  'centripetal',
)
cameraCurve.arcLengthDivisions = LENGTH_DIVISIONS

const lengths = cameraCurve.getLengths(LENGTH_DIVISIONS)

export const pathLength = cameraCurve.getLength()

function distanceAlongPath(keyIndex: number) {
  return lengths[Math.round((keyIndex / (keys.length - 1)) * LENGTH_DIVISIONS)] / pathLength
}

function mark(name: NonNullable<(typeof keys)[number]['mark']>) {
  return distanceAlongPath(keys.findIndex((key) => key.mark === name))
}

export interface Station {
  from: number
  to: number
  /** Seconds for the slow camera drift along this stretch once the camera has arrived. */
  drift: number
}

export const stations: Record<SceneId, Station> = {
  home: { from: mark('home:from'), to: mark('home:to'), drift: 11 },
  about: { from: mark('about:from'), to: mark('about:to'), drift: 22 },
  menu: { from: mark('menu:from'), to: mark('menu:to'), drift: 3.4 },
  gallery: { from: mark('gallery:from'), to: mark('gallery:to'), drift: 26 },
  contact: { from: mark('contact:from'), to: mark('contact:to'), drift: 16 },
}

export interface Mood {
  fog: string
  fogDensity: number
  key: number
  environment: number
}

/** Grading per room. It blends along the path, so light changes as you travel through a door. */
export const moods: { at: number; mood: Mood }[] = [
  { at: 0, mood: { fog: '#150b07', fogDensity: 0.07, key: 26, environment: 0.3 } },
  { at: stations.home.to, mood: { fog: '#150b07', fogDensity: 0.07, key: 26, environment: 0.3 } },
  { at: stations.about.from, mood: { fog: '#2a170d', fogDensity: 0.05, key: 18, environment: 0.6 } },
  { at: stations.menu.from, mood: { fog: '#24140c', fogDensity: 0.045, key: 20, environment: 0.5 } },
  { at: stations.gallery.from, mood: { fog: '#1b1210', fogDensity: 0.04, key: 26, environment: 0.72 } },
  { at: stations.gallery.to, mood: { fog: '#1b1210', fogDensity: 0.04, key: 26, environment: 0.72 } },
  { at: stations.contact.from, mood: { fog: '#3a2317', fogDensity: 0.05, key: 10, environment: 0.62 } },
  { at: 1, mood: { fog: '#3a2317', fogDensity: 0.05, key: 10, environment: 0.62 } },
]
