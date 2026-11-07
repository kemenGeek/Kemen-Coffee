import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { TestimonialCard } from '../components/TestimonialCard'
import { testimonials } from '../data/testimonials'

export function Testimonials() {
  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="section-pad bg-cream/(--section-veil)">
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="testimonials-heading"
            index="05"
            label="Kind Words"
            title={
              <>
                What Coffee Lovers <em className="font-normal italic">Say.</em>
              </>
            }
          />
          <Reveal delay={0.1}>
            <p className="eyebrow inline-block rounded-full border border-coffee/40 px-4 py-2.5 !tracking-[0.16em] text-coffee">
              Demo content: fictional reviews
            </p>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-3 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <li key={testimonial.id}>
              <Reveal delay={index * 0.1} className="h-full">
                <TestimonialCard testimonial={testimonial} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
