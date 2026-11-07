import { ContactForm } from '../components/ContactForm'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { contactDetails } from '../data/contact'

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="section-pad bg-cream-light/(--section-veil)">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-0">
        <div className="lg:col-span-5">
          <SectionHeading
            id="contact-heading"
            index="06"
            label="Visit Us"
            title={
              <>
                Let’s Share <em className="font-normal italic">a Cup.</em>
              </>
            }
          />
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-pretty text-charcoal/80">
              Stop by, say hello, or send us a note. There’s always a seat and a fresh cup waiting.
            </p>

            <ul className="mt-10 border-b border-espresso/15">
              {contactDetails.map(({ label, value, icon: Icon }) => (
                <li key={label} className="flex items-center gap-5 border-t border-espresso/15 py-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cream text-coffee">
                    <Icon aria-hidden className="size-5" strokeWidth={1.6} />
                  </span>
                  <div className="min-w-0">
                    <p className="eyebrow text-coffee">{label}</p>
                    <p className="mt-1 text-lg break-words text-espresso">{value}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-5 text-sm text-coffee">
              These are placeholder details for demonstration, not a real address or inbox.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="lg:col-span-6 lg:col-start-7">
          <ContactForm />
        </Reveal>
      </div>
    </section>
  )
}
