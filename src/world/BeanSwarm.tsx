import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { InstancedMesh, MathUtils, Matrix4, Mesh, Object3D, Vector3 } from 'three'
import { useWorld } from './CoffeeHouse'
import { approach, rigIsNear } from './Atmosphere'
import { cameraCurve, stations } from './path'
import { rig, travelAmount } from './rig'

const HOME_CENTRE = new Vector3(0, 1.17, 0)
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

const dummy = new Object3D()
const orbit = new Vector3()
const stream = new Vector3()
const form = new Vector3()
const lead = new Vector3()
const placed = new Matrix4()

/** Below this the swarm is hidden: a scale of zero breaks the lighting of instanced meshes. */
const MIN_PRESENCE = 0.002

/**
 * The same beans play three parts: they float around the hero cup, stream past the camera on any
 * journey, and pull together in the gallery as a sculpture that keeps changing shape.
 */
export function BeanSwarm({ count }: { count: number }) {
  const { scene, nodes } = useWorld()
  const swarmRef = useRef<InstancedMesh>(null)
  const restingRef = useRef<InstancedMesh>(null)
  const presence = useRef(0)
  const bean = nodes.bean__bean as Mesh
  const { geometry, material } = bean

  // Compressed meshes rely on their node's transform to get back to true size, and instances
  // don't inherit it. Every instance applies it by hand.
  const beanTransform = useMemo(() => {
    scene.updateMatrixWorld(true)
    return bean.matrixWorld.clone()
  }, [scene, bean])

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        angle: Math.random() * Math.PI * 2,
        radius: 0.15 + Math.random() ** 0.7 * 0.5,
        height: (Math.random() - 0.5) * 0.46,
        speed: (0.5 + Math.random()) * 0.11 * (Math.random() < 0.5 ? -1 : 1),
        spin: new Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        spinSpeed: 0.3 + Math.random() * 0.9,
        size: 0.8 + Math.random() * 0.6,
        offset: Math.random() * 0.1,
        lateral: new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(2.1),
        index,
      })),
    [count],
  )

  const sculpture = useMemo(() => scene.getObjectByName('marker_sculpture')?.getWorldPosition(new Vector3()) ?? new Vector3(), [scene])

  const resting = useMemo(() => {
    scene.updateMatrixWorld(true)
    const points: Vector3[] = []
    scene.traverse((node) => {
      if (node.name.startsWith('marker_bean_')) {
        points.push(node.getWorldPosition(new Vector3()))
      }
    })
    return points
  }, [scene])

  useLayoutEffect(() => {
    const mesh = restingRef.current
    if (!mesh) {
      return
    }

    resting.forEach((position, index) => {
      dummy.position.copy(position)
      dummy.rotation.set(0, index * 2.4, 0)
      dummy.scale.setScalar(0.85 + (index % 5) * 0.09)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, placed.multiplyMatrices(dummy.matrix, beanTransform))
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [resting, beanTransform])

  useFrame(({ clock }, delta) => {
    const mesh = swarmRef.current
    if (!mesh) {
      return
    }

    const time = clock.elapsedTime
    const nearHome = rigIsNear(0, stations.home.to, 0.03)
    const nearSculpture = rigIsNear(stations.gallery.from, stations.gallery.to, 0.02)
    const travelling = travelAmount()
    presence.current = approach(presence.current, Math.max(nearHome, nearSculpture, travelling), 5, delta)

    mesh.visible = presence.current > MIN_PRESENCE
    if (!mesh.visible) {
      return
    }

    // The sculpture slowly breathes between a sphere and a double ring.
    const morph = 0.5 + 0.5 * Math.sin(time * 0.32)

    for (const seed of seeds) {
      const fraction = (seed.index + 0.5) / count
      const angle = seed.angle + time * seed.speed

      orbit
        .set(Math.cos(angle) * seed.radius, seed.height + Math.sin(time * 0.5 + seed.angle) * 0.03, Math.sin(angle) * seed.radius * 0.8)
        .add(HOME_CENTRE)

      const along = MathUtils.euclideanModulo(rig.position + 0.008 + seed.offset, 1)
      stream.copy(cameraCurve.getPointAt(along, lead)).add(seed.lateral)

      const lat = Math.acos(1 - 2 * fraction)
      const lon = seed.index * GOLDEN + time * 0.14
      const sphereRadius = 0.25
      const ringAngle = fraction * Math.PI * 8 + time * 0.2
      const ringX = Math.cos(ringAngle) * (0.24 + 0.03 * Math.sin(fraction * 40))
      const ringZ = Math.sin(ringAngle) * (0.24 + 0.03 * Math.sin(fraction * 40))
      const ringY = Math.sin(fraction * Math.PI * 4 + time * 0.3) * 0.11
      form.set(
        MathUtils.lerp(Math.sin(lat) * Math.cos(lon) * sphereRadius, ringX, morph),
        MathUtils.lerp(Math.cos(lat) * sphereRadius, ringY, morph),
        MathUtils.lerp(Math.sin(lat) * Math.sin(lon) * sphereRadius, ringZ, morph),
      ).add(sculpture)

      dummy.position.copy(stream).lerp(orbit, nearHome).lerp(form, nearSculpture)
      dummy.quaternion.setFromAxisAngle(seed.spin, time * seed.spinSpeed + seed.angle)
      dummy.scale.setScalar(seed.size * presence.current * (1 + nearHome * 0.25 + nearSculpture * 0.35))
      dummy.updateMatrix()
      mesh.setMatrixAt(seed.index, placed.multiplyMatrices(dummy.matrix, beanTransform))
    }

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={swarmRef} args={[geometry, material, count]} frustumCulled={false} castShadow />
      <instancedMesh ref={restingRef} args={[geometry, material, resting.length]} frustumCulled={false} castShadow receiveShadow />
    </>
  )
}

