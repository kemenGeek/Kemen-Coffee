import type { GalleryItem } from '../types'
import { images } from './images'

const PORTRAIT_TALL = 'row-span-3 lg:row-span-4'
const PORTRAIT = 'row-span-3'
const LANDSCAPE = 'col-span-2 row-span-2 lg:row-span-3'

export const galleryItems: GalleryItem[] = [
  {
    id: 'lattes',
    caption: 'Rosetta art, served side by side',
    category: 'Coffee drinks',
    image: images.galleryLattes,
    spanClass: PORTRAIT_TALL,
  },
  {
    id: 'garden-cafe',
    caption: 'Morning light in the garden room',
    category: 'Café interiors',
    image: images.galleryGardenCafe,
    spanClass: LANDSCAPE,
  },
  {
    id: 'steam',
    caption: 'A fresh cup on a slow morning',
    category: 'Coffee lifestyle',
    image: images.gallerySteam,
    spanClass: PORTRAIT_TALL,
  },
  {
    id: 'counter',
    caption: 'Behind the bar, before the rush',
    category: 'Barista preparation',
    image: images.galleryCounter,
    spanClass: LANDSCAPE,
  },
  {
    id: 'beans',
    caption: 'Freshly ground, freshly roasted',
    category: 'Coffee beans',
    image: images.galleryBeans,
    spanClass: PORTRAIT,
  },
  {
    id: 'ring',
    caption: 'Every shade of a good roast',
    category: 'Coffee lifestyle',
    image: images.galleryRing,
    spanClass: PORTRAIT,
  },
  {
    id: 'pour',
    caption: 'Steamed milk and a steady hand',
    category: 'Barista preparation',
    image: images.galleryPour,
    spanClass: 'col-span-2 row-span-2 lg:row-span-4',
  },
  {
    id: 'latte-table',
    caption: 'Just set down, still warm',
    category: 'Coffee drinks',
    image: images.galleryLatteTable,
    spanClass: PORTRAIT,
  },
  {
    id: 'window',
    caption: 'A quiet table by the window',
    category: 'Café interiors',
    image: images.galleryWindow,
    spanClass: PORTRAIT,
  },
]
