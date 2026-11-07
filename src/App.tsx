import { MotionConfig } from 'motion/react'
import { BackToTop } from './components/BackToTop'
import { Navbar } from './components/Navbar'
import { ToastProvider } from './components/ToastProvider'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { Experience } from './sections/Experience'
import { Footer } from './sections/Footer'
import { Gallery } from './sections/Gallery'
import { Hero } from './sections/Hero'
import { Menu } from './sections/Menu'
import { Testimonials } from './sections/Testimonials'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <a
          href="#main"
          className="sr-only rounded-full bg-cream px-5 py-3 text-sm font-semibold text-espresso focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60]"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" tabIndex={-1}>
          <Hero />
          <About />
          <Menu />
          <Experience />
          <Gallery />
          <Testimonials />
          <Contact />
        </main>
        <Footer />
        <BackToTop />
      </ToastProvider>
    </MotionConfig>
  )
}
