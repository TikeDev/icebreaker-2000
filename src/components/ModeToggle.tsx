export type SlotMode = 'safe' | 'chaos'

interface ModeToggleProps {
  mode: SlotMode
  onChange: (mode: SlotMode) => void
  disabled: boolean
}

function ModeToggle({ mode, onChange, disabled }: ModeToggleProps) {
  const nextMode: SlotMode = mode === 'safe' ? 'chaos' : 'safe'
  const activeModeLabel = mode === 'safe' ? 'SAFE' : 'CHAOS'

  return (
    <button
      type="button"
      className="mode-toggle"
      onClick={() => onChange(nextMode)}
      disabled={disabled}
      aria-label={`Switch mode. Current mode: ${activeModeLabel}.`}
    >
      <span className="mode-toggle-prefix">MODE: </span>
      <span className="mode-toggle-value">{activeModeLabel}</span>
    </button>
  )
}

export default ModeToggle
