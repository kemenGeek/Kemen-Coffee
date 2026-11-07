export type Tier = 0 | 1 | 2

export interface QualitySettings {
  dpr: number
  beans: number
  dust: number
  shadowSize: number
  fillLights: number
  depthOfField: boolean
  bloom: boolean
  grain: boolean
  multisampling: number
}

export const qualityByTier: Record<Tier, QualitySettings> = {
  0: { dpr: 1, beans: 70, dust: 120, shadowSize: 512, fillLights: 3, depthOfField: false, bloom: false, grain: false, multisampling: 0 },
  1: { dpr: 1.35, beans: 150, dust: 280, shadowSize: 1024, fillLights: 5, depthOfField: false, bloom: true, grain: true, multisampling: 0 },
  2: { dpr: 1.5, beans: 220, dust: 420, shadowSize: 1024, fillLights: 6, depthOfField: true, bloom: true, grain: true, multisampling: 2 },
}

export function startingTier(): Tier {
  const { deviceMemory } = navigator as Navigator & { deviceMemory?: number }
  const cores = navigator.hardwareConcurrency ?? 4
  const touch = window.matchMedia('(pointer: coarse)').matches

  if (cores <= 4 || (deviceMemory !== undefined && deviceMemory <= 3)) {
    return 0
  }

  return touch ? 1 : 2
}

export function canRenderWorld() {
  const { connection } = navigator as Navigator & { connection?: { saveData?: boolean } }

  if (connection?.saveData || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false
  }

  try {
    return document.createElement('canvas').getContext('webgl2') !== null
  } catch {
    return false
  }
}
