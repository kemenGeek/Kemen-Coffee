import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

interface SceneStageProps {
  children: ReactNode
  /** Sits over the world and beside the text, for anything the visitor handles directly. */
  overlay?: ReactNode
  className?: string
}

/**
 * The top of a section: its title and introduction over a clear view of the 3D world, so the
 * animation and the information arrive together. The rest of the section follows on a sheet.
 */
export function SceneStage({ children, overlay, className }: SceneStageProps) {
  return (
    <div
      data-scene-stage
      data-theme="dark"
      className={cn(
        'relative isolate flex h-[calc(100svh-8.5rem)] min-h-[34rem] items-end text-cream',
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-espresso-deep/95 from-15% via-espresso-deep/55 via-50% to-transparent lg:bg-gradient-to-r lg:from-espresso-deep/85 lg:from-0% lg:via-espresso-deep/40 lg:via-45% lg:to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-3/5 bg-gradient-to-t from-espresso-deep/80 to-transparent"
      />
      {overlay}
      <div className="pointer-events-none container-x pb-16 md:pb-20">{children}</div>
    </div>
  )
}
