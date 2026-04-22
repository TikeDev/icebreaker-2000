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
            onPaletteChange={setPalette}
            onDarkToggle={handleDarkModeToggle}
          />
        </main>
      </div>
    </div>
  )
}

export default App
