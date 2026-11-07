import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Lightbox } from '../components/Lightbox'
import { Picture } from '../components/Picture'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { galleryItems } from '../data/gallery'
import { cn } from '../lib/cn'

export function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="section-pad bg-cream-light/(--section-veil)">
      <div className="container-x">
        <SectionHeading
          id="gallery-heading"
          index="04"
          label="The Gallery"
          title={
            <>
              Moments at <em className="font-normal italic">KEMEN.</em>
            </>
          }
        />

        <ul className="mt-14 grid auto-rows-[5.25rem] grid-flow-dense grid-cols-2 gap-3 md:auto-rows-[8rem] md:gap-4 lg:mt-20 lg:auto-rows-[clamp(5.5rem,7.75vw,8rem)] lg:grid-cols-4">
          {galleryItems.map((item, index) => (
            <li key={item.id} className={item.spanClass}>
              <Reveal delay={(index % 4) * 0.06} className="size-full">
                <button
                  type="button"
                  onClick={() => setOpenIndex(index)}
                  aria-label={`Open image: ${item.caption}`}
                  className="group relative block size-full overflow-hidden rounded-2xl bg-beige"
                >
                  <Picture
                    photo={item.image}
                    sizes={cn(
                      item.spanClass.includes('col-span-2')
                        ? '(min-width: 1024px) 50vw, 92vw'
                        : '(min-width: 1024px) 25vw, 46vw',
                    )}
                    className="size-full object-cover transition-transform duration-[1100ms] ease-premium group-hover:scale-[1.06] group-focus-visible:scale-[1.06]"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-espresso-deep/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-x-4 bottom-4 flex translate-y-2 items-end justify-between gap-3 text-left text-cream opacity-0 transition-all duration-500 ease-premium group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                  >
                    <span className="font-serif text-base leading-snug md:text-lg">
                      {item.caption}
                    </span>
                    <Plus className="size-5 shrink-0" />
                  </span>
                </button>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>

      <Lightbox
        items={galleryItems}
        index={openIndex}
        onChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
      />
    </section>
  )
}
