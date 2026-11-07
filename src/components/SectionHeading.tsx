import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { Reveal } from './Reveal'

interface SectionHeadingProps {
  id: string
  index: string
  label: string
  title: ReactNode
  tone?: 'light' | 'dark'
  className?: string
}

export function SectionHeading({
  id,
  index,
  label,
  title,
  tone = 'light',
  className,
}: SectionHeadingProps) {
  return (
    <Reveal className={className}>
      <p
        className={cn(
          'eyebrow flex items-center gap-4',
          tone === 'dark' ? 'text-beige' : 'text-coffee',
        )}
      >
        <span>N° {index}</span>
        <span aria-hidden className="h-px w-10 bg-current opacity-50" />
        <span>{label}</span>
      </p>
      <h2
        id={id}
        className={cn(
          'display-heading mt-6 text-[clamp(2.6rem,5.8vw,5.25rem)] leading-[1.03]',
          tone === 'dark' ? 'text-cream' : 'text-espresso',
        )}
      >
        {title}
      </h2>
    </Reveal>
  )
}
