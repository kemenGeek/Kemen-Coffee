import type { ExperiencePillar } from '../types'
import { images } from './images'

export const experiencePillars: ExperiencePillar[] = [
  {
    id: 'atmosphere',
    title: 'Relaxing atmosphere',
    description:
      'Soft light, unhurried corners, and a table that stays yours for as long as you like.',
    image: images.atmosphere,
    aspectClass: 'aspect-[4/3]',
    placementClass: 'md:col-start-1 md:row-start-1',
  },
  {
    id: 'ingredients',
    title: 'Quality ingredients',
    description:
      'Carefully selected beans, fresh milk, and real syrups, with nothing added for show.',
    image: images.ingredients,
    aspectClass: 'aspect-[4/5]',
    placementClass: 'md:col-start-2 md:row-start-1 md:row-span-2',
  },
  {
    id: 'crafted',
    title: 'Thoughtfully crafted beverages',
    description: 'Every recipe is balanced by hand, so each sip tastes the way it was meant to.',
    image: images.crafted,
    aspectClass: 'aspect-[4/5]',
    placementClass: 'md:col-start-1 md:row-start-2 md:row-span-2',
  },
  {
    id: 'memorable',
    title: 'Memorable café experiences',
    description: 'The catch-ups, the quiet mornings, and the conversations that run a little long.',
    image: images.memorable,
    aspectClass: 'aspect-[4/3]',
    placementClass: 'md:col-start-2 md:row-start-3',
  },
]
