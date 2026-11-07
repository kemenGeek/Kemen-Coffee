import type { Photo } from '../types'

interface PictureProps {
  photo: Photo
  sizes: string
  className?: string
  priority?: boolean
  draggable?: boolean
}

export function Picture({ photo, sizes, className, priority = false, draggable }: PictureProps) {
  return (
    <img
      src={photo.src}
      srcSet={photo.srcSet}
      sizes={sizes}
      width={photo.width}
      height={photo.height}
      alt={photo.alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      draggable={draggable}
      className={className}
      style={photo.focus ? { objectPosition: photo.focus } : undefined}
    />
  )
}
