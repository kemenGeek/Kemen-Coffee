import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo } from 'react'
import {
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  RepeatWrapping,
  ShaderChunk,
  SRGBColorSpace,
  Vector3,
  type Texture,
} from 'three'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { galleryItems } from '../data/gallery'
import { LightCones, Steam } from './Atmosphere'

export const WORLD_URL = `${import.meta.env.BASE_URL}models/kemen-world.glb`

// A single overflowing highlight would otherwise be spread across the whole frame by Bloom.
ShaderChunk.opaque_fragment += /* glsl */ `
  if (any(isnan(gl_FragColor)) || any(isinf(gl_FragColor))) gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  gl_FragColor.rgb = clamp(gl_FragColor.rgb, 0.0, 32.0);
`

const PHOTO_ASPECT = 1
const GALLERY_SLOTS = 10
const photoUrls = galleryItems.slice(0, GALLERY_SLOTS).map(({ image }) => image.src)

/** Blender stores a neutral plaster and cloth; each surface takes its colour here. */
const tints: Record<string, string> = {
  wall_warm: '#a58a6f',
  wall_dark: '#3a261c',
  cloth: '#b59878',
  rug: '#4b352a',
}

const lamps: { position: [number, number, number]; length: number; radius: number }[] = [
  { position: [-3.6, 2, -6], length: 2, radius: 1 },
  { position: [-3.4, 2, -9.4], length: 2, radius: 1 },
  { position: [-4.2, 2, -12.8], length: 2, radius: 1 },
  { position: [-1.2, 2, -14.8], length: 2, radius: 1 },
  { position: [1.4, 2, -6.2], length: 2, radius: 1 },
  { position: [0.2, 1.8, -38.8], length: 1.8, radius: 1.2 },
  { position: [-0.9, 3.7, -23.2], length: 2.7, radius: 0.62 },
  { position: [0.95, 3.7, -25.2], length: 2.7, radius: 0.62 },
  { position: [-0.9, 3.7, -27.2], length: 2.7, radius: 0.62 },
  { position: [0.95, 3.7, -29.2], length: 2.7, radius: 0.62 },
]

function coverCrop(texture: Texture, slotAspect: number) {
  const image = texture.image as { width: number; height: number }
  const imageAspect = image.width / image.height
  const cropped = texture.clone()
  const scale = slotAspect / imageAspect

  cropped.wrapS = cropped.wrapT = RepeatWrapping
  cropped.colorSpace = SRGBColorSpace
  cropped.anisotropy = 8

  if (scale < PHOTO_ASPECT) {
    cropped.repeat.set(scale, 1)
    cropped.offset.set((1 - scale) / 2, 0)
  } else {
    cropped.repeat.set(1, 1 / scale)
    cropped.offset.set(0, (1 - 1 / scale) / 2)
  }

  cropped.needsUpdate = true
  return cropped
}

function point(root: Object3D, name: string) {
  const found = root.getObjectByName(name)

  return found ? found.getWorldPosition(new Vector3()) : new Vector3()
}

/** Drei's bundled decoder predates the model's compression format, so three's own is used. */
const useMeshopt: Parameters<typeof useGLTF>[3] = (loader) => {
  loader.setMeshoptDecoder(MeshoptDecoder)
}

export function useWorld() {
  return useGLTF(WORLD_URL, false, false, useMeshopt)
}

export function CoffeeHouse() {
  const { scene, materials } = useWorld()
  const photos = useTexture(photoUrls)

  const { swaying, steamPoints } = useMemo(() => {
    scene.updateMatrixWorld(true)
    const moving: Object3D[] = []
    const points: { position: Vector3; height: number }[] = [
      { position: point(scene, 'marker_steam_hero'), height: 0.36 },
    ]

    scene.traverse((node) => {
      if (/^(pendant|plant)_/.test(node.name) && !node.name.includes('__')) {
        moving.push(node)
      }
      if (/^marker_steam_(cafe|lounge)/.test(node.name)) {
        points.push({ position: point(scene, node.name), height: 0.3 })
      }
    })

    return { swaying: moving, steamPoints: points }
  }, [scene])

  useLayoutEffect(() => {
    for (const [name, color] of Object.entries(tints)) {
      ;(materials[name] as MeshStandardMaterial | undefined)?.color.set(color)
    }

    const glass = materials.glass as MeshStandardMaterial
    glass.transparent = true
    glass.opacity = 0.24
    glass.depthWrite = false
    glass.envMapIntensity = 2.2

    const sky = materials.sky as MeshStandardMaterial
    sky.emissiveIntensity = 1.5

    const leaf = materials.leaf as MeshStandardMaterial
    leaf.side = DoubleSide

    scene.traverse((node) => {
      if (!(node instanceof Mesh)) {
        return
      }
      const glassy = node.material === glass
      const open = /__(lamp|sky)/.test(node.name)
      node.castShadow = !glassy && !open
      node.receiveShadow = !open
      const slot = /^gallery_slot_(\d+)/.exec(node.name)
      if (slot) {
        const photo = photos[Number(slot[1]) % photos.length]
        node.geometry.computeBoundingBox()
        const size = node.geometry.boundingBox!.getSize(new Vector3())
        // Frames hang on side walls, so a picture's width can lie along either axis.
        const map = coverCrop(photo, Math.max(size.x, size.z) / size.y)
        node.material = new MeshStandardMaterial({
          map,
          roughness: 0.46,
          emissive: '#ffffff',
          emissiveMap: map,
          emissiveIntensity: 0.34,
        })
        node.castShadow = false
      }
    })

    for (const name of ['bean', 'bean.001', 'product_cup', 'product_glass']) {
      const hidden = scene.getObjectByName(name)
      if (hidden) {
        hidden.visible = false
      }
    }
  }, [scene, materials, photos])

  useFrame(({ clock }) => {
    const time = clock.elapsedTime

    swaying.forEach((node, index) => {
      const lamp = node.name.startsWith('pendant')
      const reach = lamp ? 0.007 : 0.012
      node.rotation.z = Math.sin(time * (lamp ? 0.7 : 0.9) + index * 1.7) * reach
      node.rotation.x = Math.cos(time * (lamp ? 0.5 : 0.7) + index) * reach
    })
  })

  return (
    <>
      <primitive object={scene} />
      <LightCones lamps={lamps} />
      {steamPoints.map(({ position, height }) => (
        <Steam key={position.toArray().join()} position={position} height={height} />
      ))}
    </>
  )
}

useGLTF.preload(WORLD_URL, false, false, useMeshopt)
