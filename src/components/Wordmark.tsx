import { cn } from '../lib/cn'

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-baseline gap-2 whitespace-nowrap', className)}>
      <span className="font-serif text-[1.35rem] leading-none font-normal tracking-[0.16em]">
        KEMEN
      </span>{' '}
      <span className="font-sans text-[0.62rem] font-semibold tracking-[0.34em]">COFFEE</span>
    </span>
  )
}
