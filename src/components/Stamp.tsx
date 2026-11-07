import { cn } from '../lib/cn'

export function BeanMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.4"
      aria-hidden
      className={className}
    >
      <ellipse cx="16" cy="16" rx="9" ry="13" transform="rotate(32 16 16)" />
      <path d="M22.5 6c-6.2 3.3-2.2 8.9-5.5 12.700-1.500 1.700-3.600 3-7.200 4.300" />
    </svg>
  )
}

export function Stamp({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('relative size-36', className)}>
      <svg viewBox="0 0 160 160" className="size-full animate-stamp">
        <defs>
          <path id="stamp-circle" d="M80 80m-64 0a64 64 0 1 1 128 0a64 64 0 1 1-128 0" />
        </defs>
        <text className="fill-current font-sans text-[10px] font-semibold uppercase">
          <textPath href="#stamp-circle" textLength="396" lengthAdjust="spacing">
            Brewed with Passion • Served with Purpose •
          </textPath>
        </text>
      </svg>
      <BeanMark className="absolute inset-0 m-auto size-10" />
    </div>
  )
}
