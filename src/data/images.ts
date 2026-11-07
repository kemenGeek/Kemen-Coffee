import type { Photo } from '../types'

const files = import.meta.glob<string>('../assets/images/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

const STANDARD_WIDTHS = [640, 1280]
const WIDE_WIDTHS = [640, 1280, 1800]

function assetUrl(name: string, width: number) {
  const url = files[`../assets/images/${name}-${width}.webp`]

  if (!url) {
    throw new Error(`Missing image asset: ${name}-${width}.webp`)
  }

  return url
}

function photo(
  name: string,
  [width, height]: [number, number],
  alt: string,
  { widths = STANDARD_WIDTHS, focus }: { widths?: number[]; focus?: string } = {},
): Photo {
  return {
    src: assetUrl(name, widths[1]),
    srcSet: widths.map((size) => `${assetUrl(name, size)} ${size}w`).join(', '),
    width,
    height,
    alt,
    focus,
  }
}

export const images = {
  about: photo(
    'about-barista',
    [2400, 3600],
    'A barista pouring steamed milk into a glass of coffee, finishing a delicate latte art design',
    { focus: '50% 42%' },
  ),
  signatureLatte: photo(
    'menu-signature-latte',
    [2400, 2195],
    'Top view of a latte with rosetta art in a white cup and saucer on a dark wooden table',
  ),
  spanishLatte: photo(
    'menu-spanish-latte',
    [2400, 3600],
    'A glass of iced Spanish latte with milk swirling through espresso on a wooden table',
  ),
  caramelMacchiato: photo(
    'menu-caramel-macchiato',
    [2400, 1602],
    'A tall iced caramel macchiato with cream cascading through dark espresso',
    { focus: '30% 50%' },
  ),
  americano: photo(
    'menu-americano',
    [2400, 2400],
    'A clear glass mug of black Americano on a wooden coaster, casting a long shadow',
    { focus: '62% 50%' },
  ),
  matcha: photo(
    'menu-matcha',
    [2400, 3601],
    'An iced matcha latte in a tall glass with layers of green tea and milk and a black straw',
    { focus: '50% 62%' },
  ),
  mocha: photo(
    'menu-mocha',
    [1800, 2400],
    'A mocha with deep chocolate-brown crema and leaf latte art in a dark ceramic cup',
  ),
  atmosphere: photo(
    'exp-atmosphere',
    [2400, 1600],
    'A spacious café interior with wooden tables, dark shelving, and guests relaxing near the counter',
    { widths: WIDE_WIDTHS },
  ),
  ingredients: photo(
    'exp-ingredients',
    [2400, 3600],
    'Portafilters filled with fresh coffee grounds and whole roasted beans seen from above',
  ),
  crafted: photo(
    'exp-crafted',
    [2400, 1600],
    'Coffee beans, ground coffee, portafilters, and a heart latte arranged on a rustic wooden board',
    { widths: WIDE_WIDTHS, focus: '76% 50%' },
  ),
  memorable: photo(
    'exp-memorable',
    [2400, 1600],
    'Three friends bringing their coffee cups together over a wooden table',
    { widths: WIDE_WIDTHS },
  ),
  galleryLattes: photo(
    'gallery-lattes',
    [2400, 3600],
    'Two lattes with rosetta art on a round wooden table surrounded by leaves',
  ),
  galleryGardenCafe: photo(
    'gallery-garden-cafe',
    [2400, 1600],
    'A leafy garden café with hanging plants, woven lamps, and wooden tables',
    { widths: WIDE_WIDTHS },
  ),
  gallerySteam: photo(
    'gallery-steam',
    [2400, 3596],
    'A hand holding a white mug as steam rises from fresh coffee',
  ),
  galleryCounter: photo(
    'gallery-counter',
    [2400, 1350],
    'A bright coffee bar with an espresso machine, grinders, shelves, and warm pendant lights',
    { widths: WIDE_WIDTHS },
  ),
  galleryBeans: photo(
    'gallery-beans',
    [2400, 3000],
    'A jar of ground coffee resting on a bed of dark roasted beans',
  ),
  galleryRing: photo(
    'gallery-ring',
    [2400, 3600],
    'Eight coffee cups in different shades arranged in a circle on a round wooden tray',
  ),
  galleryPour: photo(
    'gallery-pour',
    [2400, 1343],
    'Steamed milk being poured into a white cup of coffee held in one hand',
    { widths: WIDE_WIDTHS },
  ),
  galleryLatteTable: photo(
    'gallery-latte-table',
    [2400, 3598],
    'A latte with fern-shaped art set on a warm wooden café table',
    { focus: '50% 78%' },
  ),
  galleryWindow: photo(
    'gallery-window',
    [2400, 1600],
    'A French press and cups on a round table beside tall rain-streaked windows',
    { widths: WIDE_WIDTHS, focus: '60% 70%' },
  ),
}
