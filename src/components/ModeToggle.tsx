export type SlotMode = 'safe' | 'chaos'

interface ModeToggleProps {
  mode: SlotMode
  onChange: (mode: SlotMode) => void
  disabled: boolean
}

function ModeToggle({ mode, onChange, disabled }: ModeToggleProps) {
  const nextMode: SlotMode = mode === 'safe' ? 'chaos' : 'safe'

  return (
    <button
      type="button"
      className="mode-toggle"
      onClick={() => onChange(nextMode)}
      disabled={disabled}
    >
      SAFE / CHAOS: <span>{mode === 'safe' ? 'SAFE' : 'CHAOS'}</span>
    </button>
  )
}

export default ModeToggle
