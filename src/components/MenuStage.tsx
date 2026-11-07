import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { drinks } from '../data/menu'
import { cn } from '../lib/cn'
import { rig } from '../world/rig'
import { Reveal } from './Reveal'
import { SceneStage } from './SceneStage'
import { SectionHeading } from './SectionHeading'

const RADIANS_PER_PIXEL = 0.009
const KEY_TURN = 0.32
const MAX_TILT = 0.28

function tilt(amount: number) {
  rig.inspect.pitch = Math.max(-MAX_TILT, Math.min(MAX_TILT, rig.inspect.pitch + amount))
}

/** Lets the visitor pick a drink and turn it over on the bar, by dragging or with arrow keys. */
export function MenuStage() {
  const [activeId, setActiveId] = useState(drinks[0].id)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const active = drinks.find(({ id }) => id === activeId) ?? drinks[0]

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    lastPoint.current = { x: event.clientX, y: event.clientY }
    rig.dragging = true
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!lastPoint.current) {
      return
    }
    rig.inspect.yaw += (event.clientX - lastPoint.current.x) * RADIANS_PER_PIXEL
    tilt((event.clientY - lastPoint.current.y) * RADIANS_PER_PIXEL)
    lastPoint.current = { x: event.clientX, y: event.clientY }
  }

  const handlePointerUp = () => {
    lastPoint.current = null
    rig.dragging = false
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, () => void> = {
      ArrowLeft: () => (rig.inspect.yaw -= KEY_TURN),
      ArrowRight: () => (rig.inspect.yaw += KEY_TURN),
      ArrowUp: () => tilt(-KEY_TURN),
      ArrowDown: () => tilt(KEY_TURN),
    }
    const move = moves[event.key]

    if (move) {
      event.preventDefault()
      move()
    }
  }

  return (
    <SceneStage
      overlay={
        <div
          role="slider"
          tabIndex={0}
          aria-label="Rotate the drink. Use the arrow keys to turn it."
          aria-valuetext={active.name}
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
          className="absolute inset-x-0 top-0 h-1/3 cursor-grab touch-pan-y rounded-2xl active:cursor-grabbing lg:left-2/5 lg:h-auto lg:bottom-0"
        />
      }
    >
      <SectionHeading
        id="menu-heading"
        index="02"
        label="The Menu"
        tone="dark"
        title={
          <>
            Our Signature <em className="font-normal italic">Brews</em>
          </>
        }
      />
      <Reveal delay={0.1}>
        <div aria-live="polite" className="mt-6 max-w-md">
          <p className="font-serif text-2xl text-cream">
            {active.name}
            <span className="ml-3 text-lg text-beige">₱{active.price}</span>
          </p>
          <p className="mt-2 leading-relaxed text-pretty text-cream/90">{active.description}</p>
          <p className="mt-1 text-sm text-beige">{active.notes}</p>
        </div>
        <div
          role="group"
          aria-label="Choose a drink to inspect"
          className="pointer-events-auto mt-6 flex w-fit max-w-full gap-1.5 overflow-x-auto rounded-full bg-espresso-deep/55 p-1.5 backdrop-blur-md"
        >
          {drinks.map(({ id, name }) => (
            <button
              key={id}
              type="button"
              aria-pressed={activeId === id}
              onClick={() => {
                setActiveId(id)
                rig.drinkId = id
              }}
              className={cn(
                'h-11 shrink-0 rounded-full px-4 text-xs font-semibold whitespace-nowrap transition-colors duration-300',
                activeId === id ? 'bg-cream text-espresso' : 'text-cream hover:bg-cream/15',
              )}
            >
              {name.replace('Kemen ', '')}
            </button>
          ))}
        </div>
      </Reveal>
    </SceneStage>
  )
}
