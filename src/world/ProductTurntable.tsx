import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { BoxGeometry, BufferGeometry, Color, CylinderGeometry, Group, MathUtils, Mesh, MeshStandardMaterial, Object3D, Vector3 } from 'three'
import { useWorld } from './CoffeeHouse'
import { drinkModels, type DrinkModel } from './drinks'
import { rig } from './rig'

const DISPLAY_SCALE = 1.25
/** The drink tilts about its middle, not its foot. */
const PIVOT_HEIGHT = 0.08
const AUTO_SPIN = 0.22
const GLASS_FOOT = 0.012
const GLASS_FOOT_RADIUS = 0.038
const GLASS_TOP_RADIUS = 0.0495
const GLASS_FILL_HEIGHT = 0.16
const MAX_ICE = 5
const GLASS_WALL = 0.0026

const surfaceTints = { latte: '#ffffff', mocha: '#a57755', black: '#2a1409' }

function radiusAt(height: number) {
  return MathUtils.lerp(GLASS_FOOT_RADIUS, GLASS_TOP_RADIUS, height / GLASS_FILL_HEIGHT)
}

/** The visitor spins this drink by dragging. Choosing another swaps it with a turn and a dip. */
export function ProductTurntable() {
  const { scene, materials } = useWorld()
  const stageRef = useRef<Group>(null)
  const displayRef = useRef<Group>(null)
  const layerRefs = useRef<(Mesh | null)[]>([])
  const iceRefs = useRef<(Mesh | null)[]>([])
  const shown = useRef('')
  const yaw = useRef(0)
  const pitch = useRef(0)

  const { anchor, cup, glass } = useMemo(() => {
    scene.updateMatrixWorld(true)
    return {
      anchor: scene.getObjectByName('marker_turntable')?.getWorldPosition(new Vector3()) ?? new Vector3(),
      cup: scene.getObjectByName('product_cup')?.clone() as Object3D,
      glass: scene.getObjectByName('product_glass')?.clone() as Object3D,
    }
  }, [scene])

  const surface = useMemo(() => (materials.crema as MeshStandardMaterial).clone(), [materials])
  const placeholder = useMemo(() => new BufferGeometry(), [])
  const iceGeometry = useMemo(() => new BoxGeometry(0.03, 0.03, 0.03, 2, 2, 2), [])

  useLayoutEffect(() => {
    cup.visible = true
    glass.visible = true
    cup.position.set(0, 0, 0)
    glass.position.set(0, 0, 0)
    cup.traverse((node) => {
      node.visible = true
      if (node instanceof Mesh) {
        node.castShadow = true
        if ((node.material as MeshStandardMaterial).name === 'crema') {
          node.material = surface
        }
      }
    })
    glass.traverse((node) => {
      node.visible = true
    })
  }, [cup, glass, surface])

  const apply = (model: DrinkModel) => {
    cup.visible = model.kind === 'cup'
    glass.visible = model.kind === 'glass'

    if (model.kind === 'cup') {
      surface.color = new Color(surfaceTints[model.surface])
      return
    }

    let height = GLASS_FOOT
    layerRefs.current.forEach((mesh, index) => {
      const layer = model.layers[index]
      if (!mesh) {
        return
      }
      mesh.visible = Boolean(layer)
      if (layer) {
        const top = height + layer.height
        mesh.geometry.dispose()
        // Each layer follows the taper of the glass, so together they read as one liquid.
        mesh.geometry = new CylinderGeometry(radiusAt(top) - GLASS_WALL, radiusAt(height) - GLASS_WALL, layer.height, 40)
        mesh.position.y = height + layer.height / 2
        ;(mesh.material as MeshStandardMaterial).color.set(layer.color)
        height = top
      }
    })
    iceRefs.current.forEach((mesh, index) => {
      if (mesh) {
        mesh.visible = index < model.ice
      }
    })
  }

  useFrame((_, delta) => {
    const stage = stageRef.current
    const display = displayRef.current
    if (!stage || !display) {
      return
    }

    if (shown.current !== rig.drinkId) {
      const first = shown.current === ''
      shown.current = rig.drinkId
      const model = drinkModels[rig.drinkId]

      if (first) {
        apply(model)
      } else {
        gsap.killTweensOf([display.scale, display.position, display.rotation])
        gsap
          .timeline()
          .to(display.scale, { x: 0.6, y: 0.04, z: 0.6, duration: 0.24, ease: 'power2.in', onComplete: () => apply(model) })
          .to(display.scale, { x: 1, y: 1, z: 1, duration: 0.65, ease: 'back.out(1.5)' })
        gsap.fromTo(display.rotation, { y: 0 }, { y: Math.PI * 2, duration: 0.9, ease: 'power3.out' })
      }
    }

    yaw.current = MathUtils.damp(yaw.current, rig.inspect.yaw, 9, delta)
    pitch.current = MathUtils.damp(pitch.current, rig.inspect.pitch, 9, delta)
    rig.inspect.yaw += AUTO_SPIN * delta * (rig.dragging ? 0 : 1)
    stage.rotation.set(pitch.current, yaw.current, 0, 'XYZ')
  })

  return (
    <group position={anchor} scale={DISPLAY_SCALE}>
      <group ref={stageRef} position={[0, PIVOT_HEIGHT, 0]}>
        <group ref={displayRef} position={[0, -PIVOT_HEIGHT, 0]}>
          <primitive object={cup} position={[0, 0.005, 0]} />
          <primitive object={glass} />
          <group visible>
            {Array.from({ length: 3 }, (_, index) => (
              <mesh
                key={index}
                ref={(node) => {
                  layerRefs.current[index] = node
                }}
                geometry={placeholder}
                visible={false}
              >
                <meshStandardMaterial roughness={0.24} />
              </mesh>
            ))}
            {Array.from({ length: MAX_ICE }, (_, index) => (
              <mesh
                key={index}
                ref={(node) => {
                  iceRefs.current[index] = node
                }}
                geometry={iceGeometry}
                position={[Math.cos(index * 2.3) * 0.017, 0.11 + (index % 3) * 0.022, Math.sin(index * 2.3) * 0.017]}
                rotation={[index, index * 1.7, index * 0.6]}
                visible={false}
              >
                <meshStandardMaterial color="#e9f2f4" roughness={0.08} transparent opacity={0.5} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  )
}
