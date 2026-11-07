export type DrinkModel =
  | { kind: 'cup'; surface: 'latte' | 'black' | 'mocha' }
  | { kind: 'glass'; layers: { color: string; height: number }[]; ice: number }

/** How each item on the menu is served on the turntable, keyed by its id in data/menu.ts. */
export const drinkModels: Record<string, DrinkModel> = {
  'signature-latte': { kind: 'cup', surface: 'latte' },
  'spanish-latte': {
    kind: 'glass',
    ice: 5,
    layers: [
      { color: '#e7cfa8', height: 0.05 },
      { color: '#a8693a', height: 0.04 },
      { color: '#3c2011', height: 0.05 },
    ],
  },
  'caramel-macchiato': {
    kind: 'glass',
    ice: 4,
    layers: [
      { color: '#f0e0c2', height: 0.07 },
      { color: '#7a4620', height: 0.04 },
      { color: '#c0812f', height: 0.03 },
    ],
  },
  'classic-americano': { kind: 'cup', surface: 'black' },
  'iced-matcha-latte': {
    kind: 'glass',
    ice: 5,
    layers: [
      { color: '#efe6d2', height: 0.06 },
      { color: '#a5b566', height: 0.04 },
      { color: '#6e8a3a', height: 0.04 },
    ],
  },
  'mocha-espresso': { kind: 'cup', surface: 'mocha' },
}
