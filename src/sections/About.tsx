import { ParallaxImage } from '../components/ParallaxImage'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { highlights } from '../data/about'
import { images } from '../data/images'

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="section-pad overflow-clip bg-cream-light/(--section-veil)"
    >
      <div className="container-x grid items-center gap-16 lg:grid-cols-12 lg:gap-0">
        <Reveal className="relative mx-auto w-full max-w-lg lg:col-span-5 lg:max-w-none">
          <div
            aria-hidden
            className="absolute -inset-x-3 -top-3 bottom-1/3 rounded-t-[999px] border border-b-0 border-coffee/30 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
          />
          <ParallaxImage
            photo={images.about}
            sizes="(min-width: 1024px) 40vw, (min-width: 640px) 512px, 92vw"
            className="aspect-[4/5] rounded-t-[999px] rounded-b-2xl bg-beige shadow-lift"
          />
          <p className="absolute -right-2 bottom-10 max-w-[12.5rem] rounded-2xl bg-espresso px-5 py-4 font-serif text-lg leading-snug font-light text-balance text-cream italic shadow-lift sm:-right-8">
            Poured by hand, one cup at a time.
          </p>
        </Reveal>

        <div className="lg:col-span-6 lg:col-start-7">
          <SectionHeading
            id="about-heading"
            index="01"
            label="Our Story"
            title={
              <>
                Crafted for <em className="font-normal italic">Coffee Lovers.</em>
              </>
            }
          />
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-pretty text-charcoal/80">
              At KEMEN COFFEE, we believe great coffee is more than a drink. It’s an experience
              worth sharing. From carefully selected beans to thoughtfully crafted beverages, every
              cup is made to inspire your day.
            </p>
          </Reveal>

          <ul className="mt-12 border-b border-espresso/15">
            {highlights.map(({ title, description, icon: Icon }, index) => (
              <li key={title} className="border-t border-espresso/15">
                <Reveal delay={0.12 + index * 0.08} className="flex items-center gap-5 py-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cream text-coffee">
                    <Icon aria-hidden className="size-5" strokeWidth={1.6} />
                  </span>
                  <div>
                    <h3 className="font-serif text-xl font-normal text-espresso">{title}</h3>
                    <p className="mt-0.5 text-[0.95rem] text-charcoal/70">{description}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
