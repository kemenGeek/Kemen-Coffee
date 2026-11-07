import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useMemo, useRef } from 'react'
import { Color, FogExp2, MathUtils, PerspectiveCamera, SpotLight, Vector3 } from 'three'
import type { SceneId } from '../data/scenes'
import { cameraCurve, lookCurve, moods, pathLength, stations } from './path'
import { rig } from './rig'

const INTRO_SECONDS = 3.6
const MIN_TRAVEL_SECONDS = 1.9
const MAX_TRAVEL_SECONDS = 3.8
const SECONDS_PER_METRE = 0.11
/** How quickly the camera catches up with GSAP. This is what makes interruptions seamless. */
const CHASE = 6.5
/** The page comes back before the camera has fully landed. */
const CONTENT_RETURNS_AT = 0.68
const ROLL_PER_SPEED = 0.42
const PARALLAX_X = 0.1
const PARALLAX_Y = 0.05
const WIDE_FOV = 33
const PORTRAIT_FOV = 50
/** Keeps subjects clear of the page's text: right on wide screens, above it on phones. */
const WIDE_SHIFT = 0.15
const PORTRAIT_SHIFT = 0.25

const position = new Vector3()
const look = new Vector3()
const forward = new Vector3()
const right = new Vector3()
const up = new Vector3()
const colorA = new Color()
const colorB = new Color()

export const focusPoint = new Vector3()

function setTravelling(active: boolean) {
  document.documentElement.toggleAttribute('data-travelling', active)
}

interface DirectorProps {
  destination: SceneId
  shadowSize: number
  /** Counts journeys, so the same destination can be asked for twice in a row. */
  journey: number
  /** Whether the page steps aside for this flight, as it does after a click. */
  clearPage: boolean
}

/** Decides where the camera is going and flies it there. */
export function Director({ destination, journey, clearPage, shadowSize }: DirectorProps) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const size = useThree((state) => state.size)
  const scene = useThree((state) => state.scene)
  const tween = useRef<gsap.core.Tween | null>(null)
  const drift = useRef<gsap.core.Tween | null>(null)
  const key = useMemo(() => {
    const light = new SpotLight('#ffe6cc', 20, 9, 0.62, 0.75, 1.5)
    light.castShadow = true
    light.shadow.bias = -0.0004
    light.shadow.normalBias = 0.02
    return light
  }, [])

  useEffect(() => {
    key.shadow.mapSize.set(shadowSize, shadowSize)
    key.shadow.map?.dispose()
    key.shadow.map = null
  }, [key, shadowSize])

  const settle = (id: SceneId) => {
    const station = stations[id]
    rig.arrived = true
    rig.arrivals += 1
    const onward = rig.target <= (station.from + station.to) / 2

    if (id === 'menu') {
      // The camera stays on the pour, then moves around to the finished drink.
      drift.current = gsap.to(rig, {
        target: station.to,
        delay: 4,
        duration: station.drift,
        ease: 'sine.inOut',
      })
      return
    }

    drift.current = gsap.to(rig, {
      target: onward ? station.to : station.from,
      duration: station.drift,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
  }

  useEffect(() => {
    drift.current?.kill()
    tween.current?.kill()

    const station = stations[destination]
    const goal = destination === 'menu' || rig.target <= station.from ? station.from : station.to
    const intro = journey === 0

    rig.station = destination
    rig.arrived = false
    setTravelling(clearPage)

    const metres = Math.abs(goal - rig.target) * pathLength
    tween.current = gsap.to(rig, {
      target: goal,
      duration: intro
        ? INTRO_SECONDS
        : MathUtils.clamp(1.1 + metres * SECONDS_PER_METRE, MIN_TRAVEL_SECONDS, MAX_TRAVEL_SECONDS),
      ease: intro ? 'power3.out' : 'power2.inOut',
      onUpdate() {
        if (this.progress() > CONTENT_RETURNS_AT) {
          setTravelling(false)
        }
      },
      onComplete: () => settle(destination),
    })

    return () => {
      tween.current?.kill()
      drift.current?.kill()
    }
    // settle only reads refs and module state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, journey, clearPage])

  useEffect(() => {
    // Someone who starts reading mid-flight gets the page back straight away.
    const release = () => setTravelling(false)
    const handlePointer = (event: PointerEvent) => {
      rig.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      rig.pointer.y = (event.clientY / window.innerHeight) * 2 - 1
    }

    window.addEventListener('wheel', release, { passive: true })
    window.addEventListener('touchmove', release, { passive: true })
    window.addEventListener('pointermove', handlePointer, { passive: true })

    return () => {
      release()
      window.removeEventListener('wheel', release)
      window.removeEventListener('touchmove', release)
      window.removeEventListener('pointermove', handlePointer)
    }
  }, [])

  useEffect(() => {
    const portrait = size.width < size.height
    camera.fov = portrait ? PORTRAIT_FOV : WIDE_FOV
    camera.setViewOffset(
      size.width,
      size.height,
      portrait ? 0 : -size.width * WIDE_SHIFT,
      portrait ? size.height * PORTRAIT_SHIFT : 0,
      size.width,
      size.height,
    )
    camera.updateProjectionMatrix()
  }, [camera, size])

  const smoothPointer = useRef({ x: 0, y: 0, roll: 0 })

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const before = rig.position
    rig.position = MathUtils.damp(rig.position, rig.target, CHASE, delta)
    rig.velocity = MathUtils.damp(rig.velocity, (rig.position - before) / Math.max(delta, 0.001), 10, delta)

    const t = cameraCurve.getUtoTmapping(rig.position, 0)
    cameraCurve.getPoint(t, position)
    lookCurve.getPoint(t, look)

    const pointer = smoothPointer.current
    pointer.x = MathUtils.damp(pointer.x, rig.pointer.x, 3, delta)
    pointer.y = MathUtils.damp(pointer.y, rig.pointer.y, 3, delta)
    pointer.roll = MathUtils.damp(pointer.roll, rig.velocity * ROLL_PER_SPEED, 3, delta)

    forward.subVectors(look, position).normalize()
    right.crossVectors(forward, camera.up).normalize()
    up.crossVectors(right, forward)
    const distance = position.distanceTo(look)
    const reach = Math.min(distance, 2.2)
    position.addScaledVector(right, pointer.x * PARALLAX_X * reach).addScaledVector(up, -pointer.y * PARALLAX_Y * reach)

    camera.position.copy(position)
    camera.lookAt(look)
    camera.rotateZ(pointer.roll)
    focusPoint.copy(look)

    key.position.set(look.x + 0.9, Math.min(look.y + 2.3, 3.6), look.z + 1.1)
    key.target.position.copy(look)
    key.target.updateMatrixWorld()

    let index = 0
    while (index < moods.length - 2 && moods[index + 1].at < rig.position) {
      index++
    }
    const a = moods[index]
    const b = moods[index + 1]
    const blend = MathUtils.smoothstep(rig.position, a.at, b.at)
    const fog = scene.fog as FogExp2
    fog.color.copy(colorA.set(a.mood.fog)).lerp(colorB.set(b.mood.fog), blend)
    fog.density = MathUtils.lerp(a.mood.fogDensity, b.mood.fogDensity, blend)
    key.intensity = MathUtils.lerp(a.mood.key, b.mood.key, blend)
    scene.environmentIntensity = MathUtils.lerp(a.mood.environment, b.mood.environment, blend)
  })

  return (
    <>
      <primitive object={key} />
      <primitive object={key.target} />
    </>
  )
}
