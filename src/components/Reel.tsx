interface ReelProps {
  items: string[]
  displayValue: string
  isSpinning: boolean
  label: string
}

function Reel({ items, displayValue, isSpinning, label }: ReelProps) {
  const currentIndex = Math.max(items.indexOf(displayValue), 0)
  const visibleRows = Array.from({ length: 5 }, (_, offset) => {
    const index = (currentIndex + offset) % items.length
    return items[index]
  })

  return (
    <div className="reel">
      <p className="reel-label">{label}</p>
      <div className="reel-window" aria-hidden="true">
        <ul className={`reel-list ${isSpinning ? 'is-spinning' : ''}`}>
          {visibleRows.map((item, index) => (
            <li key={`${item}-${index}`} className={index === 2 ? 'is-active' : ''}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Reel
