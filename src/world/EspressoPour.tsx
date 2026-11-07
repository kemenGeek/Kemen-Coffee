import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, ShaderMaterial, Vector3 } from 'three'
import { Steam } from './Atmosphere'
import { useWorld } from './CoffeeHouse'
import { rig } from './rig'

const SPOUT_GAP = 0.02
const CUP_FLOOR = 0.012
const CUP_FULL = 0.05

const streamMaterial = new ShaderMaterial({
  transparent: true,
  uniforms: { uTime: { value: 0 }, uFlow: { value: 0 } },
  vertexShader: /* glsl */ `
    uniform float uTime, uFlow;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec3 p = position;
      float fall = 1.0 - uv.y;
      // Streams thin as they fall and fatten where flow pulses through them.
      float pulse = 0.82 + 0.18 * sin(fall * 34.0 - uTime * 22.0);
      p.xz *= (1.0 - fall * 0.5) * pulse * uFlow;
      p.x += sin(fall * 9.0 + uTime * 8.0) * 0.0007 * fall;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      float rim = pow(clamp(1.0 - abs(vNormal.z), 0.0, 1.0), 2.0);
      vec3 crema = vec3(0.52, 0.27, 0.11);
      vec3 body = vec3(0.13, 0.055, 0.02);
      vec3 color = mix(crema, body, smoothstep(0.0, 0.7, 1.0 - vUv.y)) + rim * vec3(0.5, 0.28, 0.14);
      gl_FragColor = vec4(color, 0.96);
    }
  `,
})

/** Runs on every arrival at the bar: the machine wakes, pulls a double shot, and the cup fills. */
export function EspressoPour() {
  const { scene, materials } = useWorld()
  const liquidRef = useRef<Mesh>(null)
  const steamRef = useRef<Group>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const seenArrival = useRef(0)
  const state = useRef({ flow: 0, fill: 0, steam: 0, gauge: 2.5 })

  const { pour, cup } = useMemo(() => {
    scene.updateMatrixWorld(true)
    return {
      pour: scene.getObjectByName('marker_pour')?.getWorldPosition(new Vector3()) ?? new Vector3(),
      cup: scene.getObjectByName('marker_brew_cup')?.getWorldPosition(new Vector3()) ?? new Vector3(),
    }
  }, [scene])

  const streamLength = pour.y - cup.y - CUP_FLOOR
  const geometry = useMemo(() => new CylinderGeometry(0.0032, 0.0032, 1, 10, 24), [])

  useLayoutEffect(() => () => void timeline.current?.kill(), [])

  useFrame(({ clock }) => {
    const { flow, fill, gauge } = state.current
    streamMaterial.uniforms.uTime.value = clock.elapsedTime
    streamMaterial.uniforms.uFlow.value = flow

    if (rig.arrived && rig.station === 'menu' && seenArrival.current !== rig.arrivals) {
      seenArrival.current = rig.arrivals
      const values = state.current
      timeline.current?.kill()
      gsap.set(values, { flow: 0, fill: 0, steam: 0 })
      timeline.current = gsap
        .timeline()
        .to(values, { gauge: 6, duration: 0.5, ease: 'power2.out' })
        .to(values, { flow: 1, duration: 0.45, ease: 'power2.out' }, 0.35)
        .to(values, { fill: 1, duration: 3, ease: 'sine.inOut' }, 0.55)
        .to(values, { flow: 0, duration: 0.55, ease: 'power2.in' }, 3.15)
        .to(values, { steam: 1, duration: 1.2, ease: 'sine.out' }, 2.6)
        .to(values, { gauge: 2.5, duration: 1.4, ease: 'sine.inOut' }, 3.4)
    }

    const gaugeMaterial = materials.gauge as MeshStandardMaterial
    gaugeMaterial.emissiveIntensity = gauge

    if (liquidRef.current) {
      liquidRef.current.position.y = cup.y + CUP_FLOOR + (CUP_FULL - CUP_FLOOR) * fill
      const radius = 0.0245 + 0.0115 * fill
      liquidRef.current.scale.set(radius, radius, 1)
      liquidRef.current.visible = fill > 0.002
    }

    if (steamRef.current) {
      steamRef.current.visible = state.current.steam > 0.02
    }
  })

  return (
    <>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          geometry={geometry}
          material={streamMaterial}
          position={[pour.x, pour.y - streamLength / 2, pour.z + side * SPOUT_GAP * 0.55]}
          scale={[1, streamLength, 1]}
          frustumCulled={false}
        />
      ))}
      <mesh ref={liquidRef} position={[cup.x, cup.y, cup.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial color="#7a4a22" roughness={0.3} />
      </mesh>
      <group ref={steamRef} visible={false}>
        <Steam position={new Vector3(cup.x, cup.y + 0.06, cup.z)} height={0.2} />
      </group>
    </>
  )
}
