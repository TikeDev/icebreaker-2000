import './App.css'
import SlotMachine from './components/SlotMachine'
import {
  readStoredPalette,
  readStoredThemeMode,
  THEME_STORAGE_KEYS,
  type PaletteId,
  type ThemeMode,
} from './theme'
import { useEffect, useState } from 'react'

const PALETTE_CYCLE_ORDER: PaletteId[] = [
  'retro-neon',
  'art-deco',
  'classic-vegas',
]

function App() {
  const [palette, setPalette] = useState<PaletteId>(readStoredPalette)
  const [themeMode, setThemeMode] = useState<ThemeMode>(readStoredThemeMode)
  const isDarkMode = themeMode === 'dark'

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEYS.palette, palette)
  }, [palette])

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEYS.dark, String(isDarkMode))
  }, [isDarkMode])

  const handleDarkModeToggle = () => {
    setThemeMode((currentMode) => (currentMode === 'light' ? 'dark' : 'light'))
  }

  const handlePaletteCycle = () => {
    setPalette((currentPalette) => {
      const currentIndex = PALETTE_CYCLE_ORDER.indexOf(currentPalette)

      if (currentIndex < 0) {
        return PALETTE_CYCLE_ORDER[0]
      }

      const nextIndex = (currentIndex + 1) % PALETTE_CYCLE_ORDER.length
      return PALETTE_CYCLE_ORDER[nextIndex]
    })
  }

  return (
    <div className="app-root" data-palette={palette} data-theme-mode={themeMode}>
      <div className="app-shell">
        <header className="title-chrome">
          <p className="title-kicker">Networking Jackpot</p>
          <h1>IceBreaker 2000</h1>
          <p className="title-subtitle">Vegas slot machine meets Y2K internet chaos.</p>
        </header>

        <main>
          <SlotMachine
            selectedPalette={palette}
            isDarkMode={isDarkMode}
            onPaletteCycle={handlePaletteCycle}
            onDarkToggle={handleDarkModeToggle}
          />
        </main>

        <footer className="app-footer">
          <p>Created by <a href="https://kerlinemoncy.carrd.co/" target="_blank">Kerline Moncy</a> at the Miami&nbsp;Frontier&nbsp;Tech&nbsp;Week&nbsp;Hackathon&nbsp;2026</p>
        </footer>
      </div>
    </div>
  )
}

export default App
