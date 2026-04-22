import type { PaletteId } from '../theme'
import moonIcon from 'pixelarticons/svg/moon.svg?raw'
import sunIcon from 'pixelarticons/svg/sun.svg?raw'

interface ThemeControlsProps {
  selectedPalette: PaletteId
  isDarkMode: boolean
  onPaletteCycle: () => void
  onDarkToggle: () => void
}

const PALETTE_SHORT_LABELS: Record<PaletteId, string> = {
  'art-deco': 'MIAMI',
  'retro-neon': 'RETRO',
  'classic-vegas': 'VEGAS',
}

function ThemeControls({
  selectedPalette,
  isDarkMode,
  onPaletteCycle,
  onDarkToggle,
}: ThemeControlsProps) {
  return (
    <div className="theme-controls">
      <button
        type="button"
        className="theme-cycle-button"
        onClick={onPaletteCycle}
        aria-label={`Cycle palette. Current palette: ${PALETTE_SHORT_LABELS[selectedPalette]}.`}
      >
        PALETTE: <span>{PALETTE_SHORT_LABELS[selectedPalette]}</span>
      </button>
      <button
        type="button"
        className="theme-icon-toggle"
        onClick={onDarkToggle}
        aria-pressed={isDarkMode}
        aria-label={isDarkMode ? 'Enable light mode' : 'Enable dark mode'}
      >
        <span
          className="theme-icon"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: isDarkMode ? sunIcon : moonIcon }}
        />
      </button>
    </div>
  )
}

export default ThemeControls
