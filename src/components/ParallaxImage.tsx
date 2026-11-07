import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { cn } from '../lib/cn'
import type { Photo } from '../types'
import { Picture } from './Picture'

interface ParallaxImageProps {
  photo: Photo
  sizes: string
  className?: string
}

export function ParallaxImage({ photo, sizes, className }: ParallaxImageProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['-5%', '5%'])

  return (
    <div ref={frameRef} className={cn('relative overflow-hidden', className)}>
      <motion.div
        style={reduceMotion ? undefined : { y }}
        className="absolute inset-x-0 -inset-y-[7%]"
      >
        <Picture photo={photo} sizes={sizes} className="size-full object-cover" />
      </motion.div>
    </div>
  )
}
