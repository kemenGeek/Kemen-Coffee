import { Wordmark } from '../components/Wordmark'
import { socialLinks } from '../data/contact'
import { navLinks } from '../data/navigation'
import { useToast } from '../hooks/useToast'

export function Footer() {
  const showToast = useToast()

  const handleSocialClick = (label: string) => {
    showToast({
      title: `${label} link coming soon`,
      description: 'Social links are placeholders until the real profiles are added.',
    })
  }

  return (
    <footer data-theme="dark" className="bg-charcoal text-cream">
      <div className="container-x py-20 lg:py-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-6 lg:col-span-7">
            <a href="#home" aria-label="KEMEN COFFEE home" className="inline-flex min-h-11 items-center">
              <Wordmark className="[&>span:first-child]:text-[clamp(2.5rem,6vw,4.5rem)] [&>span:last-child]:text-sm" />
            </a>
            <p className="mt-6 font-serif text-2xl leading-snug font-light text-beige italic">
              <span className="block">Brewed with Passion.</span>
              <span className="block">Served with Purpose.</span>
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3 lg:col-span-2 lg:col-start-9">
            <h2 className="eyebrow text-beige">Explore</h2>
            <ul className="mt-3">
              {navLinks.map(({ id, label }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="inline-flex min-h-11 min-w-11 items-center text-cream/85 transition-colors hover:text-white"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3 lg:col-span-2">
            <h2 className="eyebrow text-beige">Follow</h2>
            <ul className="mt-5 flex gap-2">
              {socialLinks.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => handleSocialClick(label)}
                    aria-label={`${label} (placeholder link)`}
                    className="grid size-11 place-items-center rounded-full border border-cream/25 transition-colors duration-300 hover:bg-cream hover:text-espresso"
                  >
                    <Icon className="size-[1.15rem]" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-cream/15 pt-6 text-sm text-cream/70 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} KEMEN COFFEE. All rights reserved.</p>
          <p>Demo website with sample content. Photography from Unsplash and Wikimedia Commons.</p>
        </div>
      </div>
    </footer>
  )
}
