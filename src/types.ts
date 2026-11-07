import type { LucideIcon } from 'lucide-react'
import type { ComponentType } from 'react'

export interface Photo {
  src: string
  srcSet: string
  width: number
  height: number
  alt: string
  focus?: string
}

export interface VideoScene {
  kind: 'video'
  video: string
  poster: string
  /** Frames the footage, which differs between wide screens and portrait phones. */
  className: string
}

export interface CollageScene {
  kind: 'collage'
  photos: Photo[]
}

export type Scene = VideoScene | CollageScene

export interface NavLink {
  id: string
  label: string
}

export type DrinkCategory = 'hot' | 'iced' | 'non-coffee'
export type MenuFilter = 'all' | DrinkCategory

export interface MenuFilterOption {
  value: MenuFilter
  label: string
}

export interface Drink {
  id: string
  name: string
  price: number
  description: string
  notes: string
  category: DrinkCategory
  image: Photo
}

export interface Highlight {
  title: string
  description: string
  icon: LucideIcon
}

export interface ExperiencePillar {
  id: string
  title: string
  description: string
  image: Photo
  aspectClass: string
  placementClass: string
}

export interface GalleryItem {
  id: string
  caption: string
  category: string
  image: Photo
  spanClass: string
}

export interface Testimonial {
  id: string
  name: string
  quote: string
  context: string
}

export interface ContactDetail {
  label: string
  value: string
  icon: LucideIcon
}

export interface SocialLink {
  label: string
  icon: ComponentType<{ className?: string }>
}
