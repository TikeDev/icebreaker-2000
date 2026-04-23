import { useEffect, useState, type CSSProperties } from 'react'

interface ReelProps {
  items: string[]
  position: number
  isSpinning: boolean
  spinVelocity: number
  label: string
  mobileVisibleRows?: number
}

const DESKTOP_ROW_HEIGHT_PX = 36
const MOBILE_ROW_HEIGHT_PX = 28
const DESKTOP_VISIBLE_ROWS = 5
const MOBILE_VISIBLE_ROWS = 3
const RENDERED_ROW_COUNT = 7
const MOBILE_BREAKPOINT_QUERY = '(max-width: 560px)'

const modulo = (value: number, divisor: number) => {
  const remainder = value % divisor
  return remainder < 0 ? remainder + divisor : remainder
}

function Reel({
  items,
  position,
  isSpinning,
  spinVelocity,
  label,
  mobileVisibleRows = MOBILE_VISIBLE_ROWS,
}: ReelProps) {
  const [isCompactLayout, setIsCompactLayout] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false
    }

    return window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const mediaQueryList = window.matchMedia(MOBILE_BREAKPOINT_QUERY)
    const handleChange = (event: MediaQueryListEvent) => {
      setIsCompactLayout(event.matches)
    }

    setIsCompactLayout(mediaQueryList.matches)
    mediaQueryList.addEventListener('change', handleChange)

    return () => {
      mediaQueryList.removeEventListener('change', handleChange)
    }
  }, [])

  if (items.length === 0) {
    return null
  }

  const rowHeightPx = isCompactLayout ? MOBILE_ROW_HEIGHT_PX : DESKTOP_ROW_HEIGHT_PX
  const clampedMobileVisibleRows = Math.max(1, mobileVisibleRows)
  const visibleRowCount = isCompactLayout ? clampedMobileVisibleRows : DESKTOP_VISIBLE_ROWS
  const activeRowIndex = Math.floor(visibleRowCount / 2)
  const normalizedPosition = modulo(position, items.length)
  const baseIndex = Math.floor(normalizedPosition)
  const rowOffset = normalizedPosition - baseIndex

  const visibleRows = Array.from({ length: RENDERED_ROW_COUNT }, (_, rowIndex) => {
    const relativeOffset = rowIndex - activeRowIndex
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
    transform: `translate3d(0, ${(-rowOffset * rowHeightPx).toFixed(3)}px, 0)`,
    filter: isSpinning
      ? `blur(${blurAmount.toFixed(2)}px) brightness(${brightness.toFixed(2)})`
      : undefined,
  }
  const reelWindowStyle: CSSProperties = {
    height: `${rowHeightPx * visibleRowCount}px`,
  }

  return (
    <div className="reel">
      <p className="reel-label">{label}</p>
      <div className="reel-window" aria-hidden="true" style={reelWindowStyle}>
        <ul className={`reel-list ${isSpinning ? 'is-spinning' : ''}`} style={reelStyle}>
          {visibleRows.map(({ item, itemIndex, rowIndex, relativeOffset }) => (
            <li
              key={`${itemIndex}-${relativeOffset}-${baseIndex}-${rowIndex}`}
              className={rowIndex === activeRowIndex ? 'is-active' : ''}
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
