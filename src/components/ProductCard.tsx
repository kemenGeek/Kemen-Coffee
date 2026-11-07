import { categoryLabels } from '../data/menu'
import type { Drink } from '../types'
import { Picture } from './Picture'

export function ProductCard({ drink }: { drink: Drink }) {
  return (
    <article className="group flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-beige shadow-soft transition-shadow duration-500 ease-premium group-hover:shadow-lift">
        <Picture
          photo={drink.image}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
          className="size-full object-cover transition-transform duration-[900ms] ease-premium group-hover:scale-[1.06]"
        />
        <span className="eyebrow absolute top-4 left-4 rounded-full bg-cream-light/92 px-3 py-1.5 !text-[0.62rem] !tracking-[0.18em] text-espresso backdrop-blur-sm">
          {categoryLabels[drink.category]}
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-4 pt-6">
        <h3 className="font-serif text-[1.55rem] leading-tight font-normal text-espresso">
          {drink.name}
        </h3>
        <p className="shrink-0 font-sans text-base font-semibold text-coffee tabular-nums">
          <span className="sr-only">Sample price: </span>₱{drink.price}
        </p>
      </div>
      <p className="mt-2 leading-relaxed text-pretty text-charcoal/75">{drink.description}</p>
      <p className="mt-3 text-sm text-coffee italic">{drink.notes}</p>
    </article>
  )
}
