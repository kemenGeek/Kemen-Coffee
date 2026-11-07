import { useEffect, useState } from 'react'

export function useScrollPast(offset: number) {
  const [isPast, setIsPast] = useState(false)

  useEffect(() => {
    const update = () => setIsPast(window.scrollY > offset)

    update()
    window.addEventListener('scroll', update, { passive: true })

    return () => window.removeEventListener('scroll', update)
  }, [offset])

  return isPast
}
