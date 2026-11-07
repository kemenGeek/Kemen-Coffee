import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { scenePreloadUrls, scenes } from '../data/scenes'
import { useScene } from '../hooks/useScene'
import { cn } from '../lib/cn'
import { easePremium } from '../lib/motion'
import type { CollageScene, Scene, VideoScene } from '../types'

const SCENE_FADE_SECONDS = 0.9
const SCENE_ZOOM_SECONDS = 1
const SCENE_ZOOM_FROM = 1.08
const COLLAGE_DRIFT_SECONDS = 16
const COLLAGE_DRIFT_SCALE = 1.1

/** How solid the section backgrounds are, in percent. Matches --section-veil in index.css. */
const VEIL_AT_REST = 87
/** Sections thin out during a transition, so the new scene is seen arriving. */
const VEIL_DURING_TRANSITION = 62

function prefersSavedData() {
  const { connection } = navigator as Navigator & { connection?: { saveData?: boolean } }

  return connection?.saveData === true
}

function SceneVideo({ scene }: { scene: VideoScene }) {
  const reduceMotion = useReducedMotion()
  const className = cn('size-full object-cover', scene.className)

  if (reduceMotion || prefersSavedData()) {
    return <img src={scene.poster} alt="" className={className} />
  }

  return (
    <video
      src={scene.video}
      poster={scene.poster}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      className={className}
    />
  )
}

function SceneCollage({ scene }: { scene: CollageScene }) {
  return (
    <div className="grid size-full grid-rows-3 gap-1 md:grid-cols-3 md:grid-rows-1">
      {scene.photos.map((photo, index) => {
        const [from, to] = index % 2 === 0 ? [1, COLLAGE_DRIFT_SCALE] : [COLLAGE_DRIFT_SCALE, 1]

        return (
          <div key={photo.src} className="min-h-0 overflow-hidden">
            <motion.img
              src={photo.src}
              alt=""
              initial={{ scale: from }}
              animate={{ scale: to }}
              transition={{
                duration: COLLAGE_DRIFT_SECONDS,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'mirror',
              }}
              className="size-full object-cover"
              style={photo.focus ? { objectPosition: photo.focus } : undefined}
            />
          </div>
        )
      })}
    </div>
  )
}

function SceneMedia({ scene }: { scene: Scene }) {
  return scene.kind === 'video' ? <SceneVideo scene={scene} /> : <SceneCollage scene={scene} />
}

/**
 * The page's shared background. A new scene fades in over the old one, and only then are the
 * scenes beneath it removed. The picture never dips to the backdrop, and a click that interrupts
 * a transition simply lays the newest scene over whatever is already showing.
 */
export function SceneBackground() {
  const { selection } = useScene()
  const reduceMotion = useReducedMotion()
  const [layers, setLayers] = useState([selection])
  const veil = useMotionValue(VEIL_AT_REST)

  if (layers.at(-1)?.count !== selection.count) {
    setLayers([...layers, selection])
  }

  useMotionValueEvent(veil, 'change', (value) => {
    document.documentElement.style.setProperty('--section-veil', `${value}%`)
  })

  useEffect(() => {
    if (selection.count === 0 || reduceMotion) {
      return
    }

    const controls = animate(veil, [veil.get(), VEIL_DURING_TRANSITION, VEIL_AT_REST], {
      duration: SCENE_FADE_SECONDS,
      ease: 'easeInOut',
      times: [0, 0.45, 1],
    })

    return () => controls.stop()
  }, [selection.count, reduceMotion, veil])

  useEffect(() => {
    for (const url of scenePreloadUrls) {
      new Image().src = url
    }
  }, [])

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 -z-10 h-lvh overflow-hidden bg-espresso-deep"
    >
      {layers.map((layer) => (
        <motion.div
          key={layer.count}
          initial={layer.count === 0 ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: SCENE_FADE_SECONDS, ease: 'easeInOut' }}
          onAnimationComplete={() =>
            setLayers((current) => current.filter(({ count }) => count >= layer.count))
          }
          className="absolute inset-0"
        >
          <motion.div
            initial={{ scale: SCENE_ZOOM_FROM }}
            animate={{ scale: 1 }}
            transition={{ duration: SCENE_ZOOM_SECONDS, ease: easePremium }}
            className="size-full"
          >
            <SceneMedia scene={scenes[layer.id]} />
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
