interface IconProps {
  className?: string
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.2 6.800h.01" />
    </svg>
  )
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M16.500 3h-2.700a4.300 4.300 0 0 0-4.300 4.300V10H7v3.500h2.500V21h3.700v-7.500h2.800l.5-3.500h-3.300V7.500c0-.6.500-1 1-1h2.300Z" />
    </svg>
  )
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M14 3v12.500a3.500 3.500 0 1 1-3.500-3.500" />
      <path d="M14 3c.4 2.900 2.400 4.900 5.500 5.200" />
    </svg>
  )
}
