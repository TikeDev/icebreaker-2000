import { isPaletteId, PALETTE_IDS, type PaletteId } from '../theme'

interface ThemeControlsProps {
  selectedPalette: PaletteId
  isDarkMode: boolean
  onPaletteChange: (palette: PaletteId) => void
  onDarkToggle: () => void
}

const PALETTE_LABELS: Record<PaletteId, string> = {
  'art-deco': 'Miami Art Deco',
  'retro-neon': 'Retro Neon',
  'classic-vegas': 'Classic Vegas',
}

function ThemeControls({
  selectedPalette,
  isDarkMode,
  onPaletteChange,
  onDarkToggle,
}: ThemeControlsProps) {
  return (
    <div className="theme-controls">
      <label className="theme-label" htmlFor="palette-select">
        Palette
      </label>
      <select
        id="palette-select"
        className="theme-select"
        value={selectedPalette}
        onChange={(event) => {
          const nextPalette = event.target.value
          if (isPaletteId(nextPalette)) {
            onPaletteChange(nextPalette)
          }
        }}
        aria-label="Choose color palette"
      >
        {PALETTE_IDS.map((paletteId) => (
          <option key={paletteId} value={paletteId}>
            {PALETTE_LABELS[paletteId]}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="theme-dark-toggle"
        onClick={onDarkToggle}
        aria-pressed={isDarkMode}
      >
        DARK: <span>{isDarkMode ? 'ON' : 'OFF'}</span>
      </button>
    </div>
  )
}

export default ThemeControls
