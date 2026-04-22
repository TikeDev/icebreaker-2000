import type { CSSProperties } from 'react'

interface ReelProps {
  items: string[]
  position: number
  isSpinning: boolean
  spinVelocity: number
  label: string
}

const ROW_HEIGHT_PX = 36
const ACTIVE_ROW_INDEX = 2
const RENDERED_ROW_COUNT = 7

const modulo = (value: number, divisor: number) => {
  const remainder = value % divisor
  return remainder < 0 ? remainder + divisor : remainder
}

function Reel({ items, position, isSpinning, spinVelocity, label }: ReelProps) {
  if (items.length === 0) {
    return null
  }

  const normalizedPosition = modulo(position, items.length)
  const baseIndex = Math.floor(normalizedPosition)
  const rowOffset = normalizedPosition - baseIndex

  const visibleRows = Array.from({ length: RENDERED_ROW_COUNT }, (_, rowIndex) => {
    const relativeOffset = rowIndex - ACTIVE_ROW_INDEX
    const itemIndex = modulo(baseIndex + relativeOffset, items.length)

    return {
      item: items[itemIndex],
      itemIndex,
      rowIndex,
      relativeOffset,
    }
  })

  const blurAmount = isSpinning
    ? Math.min(1.6, Math.abs(spinVelocity) * 0.028)
    : 0
  const brightness = isSpinning
    ? Math.min(1.2, 1 + Math.abs(spinVelocity) * 0.0022)
    : 1

  const reelStyle: CSSProperties = {
    transform: `translate3d(0, ${(-rowOffset * ROW_HEIGHT_PX).toFixed(3)}px, 0)`,
    filter: isSpinning
      ? `blur(${blurAmount.toFixed(2)}px) brightness(${brightness.toFixed(2)})`
      : undefined,
  }

  return (
    <div className="reel">
      <p className="reel-label">{label}</p>
      <div className="reel-window" aria-hidden="true">
        <ul className={`reel-list ${isSpinning ? 'is-spinning' : ''}`} style={reelStyle}>
          {visibleRows.map(({ item, itemIndex, rowIndex, relativeOffset }) => (
            <li
              key={`${itemIndex}-${relativeOffset}-${baseIndex}-${rowIndex}`}
              className={rowIndex === ACTIVE_ROW_INDEX ? 'is-active' : ''}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Reel
