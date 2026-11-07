import { ArrowRight } from 'lucide-react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

type LinkButtonVariant = 'cream' | 'espresso' | 'outline'

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode
  variant?: LinkButtonVariant
  showArrow?: boolean
}

const variantClasses: Record<LinkButtonVariant, string> = {
  cream: 'bg-cream text-espresso hover:bg-white',
  espresso: 'bg-espresso text-cream hover:bg-coffee',
  outline: 'border border-current/40 hover:border-current hover:bg-current/10',
}

export function LinkButton({
  children,
  variant = 'cream',
  showArrow = false,
  className,
  ...anchorProps
}: LinkButtonProps) {
  return (
    <a
      {...anchorProps}
      className={cn(
        'group inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-7 text-sm font-semibold tracking-wide whitespace-nowrap transition-colors duration-300 ease-premium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
      {showArrow && (
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-300 ease-premium group-hover:translate-x-1"
        />
      )}
    </a>
  )
}
