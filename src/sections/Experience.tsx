import { ParallaxImage } from '../components/ParallaxImage'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { experiencePillars } from '../data/experience'
import { cn } from '../lib/cn'

export function Experience() {
  return (
    <section
      id="experience"
      data-theme="dark"
      aria-labelledby="experience-heading"
      className="section-pad overflow-clip bg-espresso text-cream"
    >
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <SectionHeading
            id="experience-heading"
            index="03"
            label="The Experience"
            tone="dark"
            className="lg:col-span-7"
            title={
              <>
                More Than <em className="font-normal italic">Just Coffee.</em>
              </>
            }
          />
          <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9">
            <p className="text-lg leading-relaxed text-pretty text-cream/85">
              A good café gives you more than what’s in the cup. It gives you somewhere to land.
            </p>
          </Reveal>
        </div>

        <ol className="mt-16 grid gap-16 md:grid-cols-2 md:gap-x-10 lg:mt-24 lg:gap-x-20">
          {experiencePillars.map((pillar, index) => (
            <li key={pillar.id} className={pillar.placementClass}>
              <Reveal delay={index % 2 === 0 ? 0 : 0.1}>
                <ParallaxImage
                  photo={pillar.image}
                  sizes="(min-width: 768px) 46vw, 92vw"
                  className={cn('rounded-2xl bg-espresso-deep', pillar.aspectClass)}
                />
                <div className="mt-6 flex gap-5">
                  <span className="eyebrow pt-2 text-beige">0{index + 1}</span>
                  <div>
                    <h3 className="font-serif text-[1.75rem] leading-tight font-light">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 max-w-md leading-relaxed text-pretty text-cream/80">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
