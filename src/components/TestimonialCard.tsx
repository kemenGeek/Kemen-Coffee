import { Star } from 'lucide-react'
import type { Testimonial } from '../types'

const STARS = [1, 2, 3, 4, 5]

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-[1.25rem] bg-cream-light p-8 shadow-soft md:p-10">
      <div role="img" aria-label="Rated 5 out of 5 stars" className="flex gap-1 text-coffee">
        {STARS.map((star) => (
          <Star key={star} aria-hidden className="size-4 fill-current" />
        ))}
      </div>
      <blockquote className="mt-8 flex-1 font-serif text-[1.45rem] leading-snug font-light text-espresso">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="mt-10 border-t border-espresso/15 pt-5">
        <p className="font-semibold text-espresso">{testimonial.name}</p>
        <p className="mt-0.5 text-sm text-coffee">{testimonial.context}</p>
      </figcaption>
    </figure>
  )
}
