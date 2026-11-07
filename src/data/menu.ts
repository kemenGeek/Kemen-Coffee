import type { Drink, DrinkCategory, MenuFilterOption } from '../types'
import { images } from './images'

export const categoryLabels: Record<DrinkCategory, string> = {
  hot: 'Hot Coffee',
  iced: 'Iced Coffee',
  'non-coffee': 'Non-Coffee',
}

export const menuFilters: MenuFilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'hot', label: categoryLabels.hot },
  { value: 'iced', label: categoryLabels.iced },
  { value: 'non-coffee', label: categoryLabels['non-coffee'] },
]

export const drinks: Drink[] = [
  {
    id: 'signature-latte',
    name: 'Kemen Signature Latte',
    price: 165,
    description: 'Our house espresso folded into silky steamed milk.',
    notes: 'Caramel, cocoa, toasted hazelnut',
    category: 'hot',
    image: images.signatureLatte,
  },
  {
    id: 'spanish-latte',
    name: 'Spanish Latte',
    price: 175,
    description: 'Bold espresso over ice, rounded with condensed milk.',
    notes: 'Toffee, sweet cream, dark sugar',
    category: 'iced',
    image: images.spanishLatte,
  },
  {
    id: 'caramel-macchiato',
    name: 'Caramel Macchiato',
    price: 185,
    description: 'Layers of vanilla milk, espresso, and slow-cooked caramel.',
    notes: 'Vanilla, burnt sugar, butterscotch',
    category: 'iced',
    image: images.caramelMacchiato,
  },
  {
    id: 'classic-americano',
    name: 'Classic Americano',
    price: 120,
    description: 'A double espresso lengthened with hot water. Clean and bright.',
    notes: 'Dark cherry, cacao nib, citrus peel',
    category: 'hot',
    image: images.americano,
  },
  {
    id: 'iced-matcha-latte',
    name: 'Iced Matcha Latte',
    price: 180,
    description: 'Stone-ground matcha whisked smooth over chilled milk.',
    notes: 'Fresh grass, white chocolate, umami',
    category: 'non-coffee',
    image: images.matcha,
  },
  {
    id: 'mocha-espresso',
    name: 'Mocha Espresso',
    price: 170,
    description: 'Dark chocolate and espresso under a velvet layer of milk.',
    notes: 'Bittersweet cocoa, malt, roasted nut',
    category: 'hot',
    image: images.mocha,
  },
]
