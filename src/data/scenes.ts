import aboutPoster from '../assets/scenes/about-poster.webp'
import aboutVideo from '../assets/scenes/about.mp4'
import contactPoster from '../assets/scenes/contact-poster.webp'
import contactVideo from '../assets/scenes/contact.mp4'
import homePoster from '../assets/scenes/home-poster.webp'
import homeVideo from '../assets/scenes/home.mp4'
import menuPoster from '../assets/scenes/menu-poster.webp'
import menuVideo from '../assets/scenes/menu.mp4'
import type { Scene } from '../types'
import { images } from './images'

export const DEFAULT_SCENE_ID = 'home'

/** One cinematic background per navigation link, keyed by the section the link points to. */
export const scenes = {
  home: {
    kind: 'video',
    video: homeVideo,
    poster: homePoster,
    // Portrait phones keep the cup in the upper part of the screen, above the hero text.
    className:
      'object-[0%_50%] max-lg:portrait:h-[46%] max-lg:portrait:object-[76%_50%] max-lg:portrait:mask-b-from-70%',
  },
  about: { kind: 'video', video: aboutVideo, poster: aboutPoster, className: 'object-center' },
  menu: { kind: 'video', video: menuVideo, poster: menuPoster, className: 'object-[48%_50%]' },
  gallery: {
    kind: 'collage',
    photos: [images.galleryBeans, images.galleryLattes, images.galleryGardenCafe],
  },
  contact: {
    kind: 'video',
    video: contactVideo,
    poster: contactPoster,
    className: 'object-[42%_50%] max-lg:portrait:object-[12%_50%]',
  },
} as const satisfies Record<string, Scene>

export type SceneId = keyof typeof scenes

export function isSceneId(id: string): id is SceneId {
  return Object.hasOwn(scenes, id)
}

/** The image each scene shows first, so a scene has something to fade in the moment it is chosen. */
export const scenePreloadUrls = Object.values(scenes).flatMap((scene: Scene) =>
  scene.kind === 'video' ? [scene.poster] : scene.photos.map(({ src }) => src),
)
