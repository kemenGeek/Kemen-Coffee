import { useEffect, useState } from 'react'

export function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )

    for (const id of sectionIds) {
      const section = document.getElementById(id)
      if (section) {
        observer.observe(section)
      }
    }

    return () => observer.disconnect()
  }, [sectionIds])

  return activeId
}
