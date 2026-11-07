import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useScene } from '../hooks/useScene'
import { Dust } from './Atmosphere'
import { BeanSwarm } from './BeanSwarm'
import { CoffeeHouse } from './CoffeeHouse'
import { Director } from './Director'
import { EspressoPour } from './EspressoPour'
import { PostFX } from './PostFX'
import { ProductTurntable } from './ProductTurntable'
import { qualityByTier, startingTier, type Tier } from './quality'

const FILL_LIGHTS: { position: [number, number, number]; color: string; intensity: number; distance: number }[] = [
  { position: [-3.4, 2.1, -9], color: '#ffd2a8', intensity: 14, distance: 10 },
  { position: [3.6, 2.5, -15], color: '#ffd2a0', intensity: 12, distance: 7 },
  { position: [0, 3, -38], color: '#ffba85', intensity: 16, distance: 11 },
  { position: [0, 3, -25], color: '#ffe0bc', intensity: 26, distance: 11 },
  { position: [0, 2.8, -1.5], color: '#ffc58a', intensity: 3, distance: 6 },
  { position: [1.4, 2.2, -6.2], color: '#ffc58a', intensity: 8, distance: 7 },
]

function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => requestAnimationFrame(onReady))

    return () => cancelAnimationFrame(frame)
  }, [onReady])

  return null
}

/** Stops rendering while the page covers the world, which saves battery on long reads. */
function PauseWhenHidden() {
  const setFrameloop = useThree((state) => state.setFrameloop)

  useEffect(() => {
    const visible = new Set<Element>()
    const update = () => {
      const flying = document.documentElement.hasAttribute('data-travelling')
      setFrameloop(visible.size > 0 || flying ? 'always' : 'never')
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visible.add(entry.target)
        } else {
          visible.delete(entry.target)
        }
      }
      update()
    })
    const attributes = new MutationObserver(update)

    document.querySelectorAll('[data-scene-stage]').forEach((stage) => observer.observe(stage))
    attributes.observe(document.documentElement, { attributes: true, attributeFilter: ['data-travelling'] })

    return () => {
      observer.disconnect()
      attributes.disconnect()
    }
  }, [setFrameloop])

  return null
}

export default function WorldCanvas({ onReady, onLost }: { onReady: () => void; onLost: () => void }) {
  const { selection } = useScene()
  const [tier, setTier] = useState<Tier>(startingTier)
  const quality = qualityByTier[tier]
  const dpr = useMemo(() => Math.min(window.devicePixelRatio, quality.dpr), [quality.dpr])

  return (
    <Canvas
      dpr={dpr}
      shadows="percentage"
      camera={{ fov: 33, near: 0.04, far: 70, position: [1.1, 1.5, 2.6] }}
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
      style={{ pointerEvents: 'none' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault()
          onLost()
        })
      }}
    >
      <fogExp2 attach="fog" args={['#150b07', 0.07]} />
      <color attach="background" args={['#120906']} />
      <hemisphereLight args={['#ffe2c0', '#2a160c', 0.22]} />
      {FILL_LIGHTS.slice(0, quality.fillLights).map((light) => (
        <pointLight key={light.position.join()} {...light} decay={1.6} />
      ))}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} color="#ffe6c8" position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffb877" position={[-5, 1, 2]} rotation={[0, Math.PI / 2, 0]} scale={[4, 3, 1]} />
        <Lightformer form="rect" intensity={1} color="#efe0cf" position={[5, 2, -2]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 3, 1]} />
      </Environment>

      <Suspense fallback={null}>
        <CoffeeHouse />
        <BeanSwarm count={quality.beans} />
        <EspressoPour />
        <ProductTurntable />
        <ReadySignal onReady={onReady} />
      </Suspense>

      <Dust count={quality.dust} />
      <Director
        destination={selection.id}
        journey={selection.count}
        clearPage={selection.via === 'click'}
        shadowSize={quality.shadowSize}
      />
      <PostFX quality={quality} />
      <PauseWhenHidden />
      <PerformanceMonitor
        flipflops={2}
        onDecline={() => setTier((current) => (current > 0 ? ((current - 1) as Tier) : current))}
      />
    </Canvas>
  )
}
