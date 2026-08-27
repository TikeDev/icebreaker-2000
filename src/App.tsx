import './App.css'
import SlotMachine from './components/SlotMachine'
import {
  readStoredPalette,
  readStoredThemeMode,
  THEME_STORAGE_KEYS,
  type PaletteId,
  type ThemeMode,
} from './theme'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const PALETTE_CYCLE_ORDER: PaletteId[] = [
  'retro-neon',
  'art-deco',
  'classic-vegas',
]

const APP_BG_BASE_BY_THEME: Record<PaletteId, Record<ThemeMode, string>> = {
  'classic-vegas': {
    light: '#2d0000',
    dark: '#0d0504',
  },
  'art-deco': {
    light: '#0f2b33',
    dark: '#07181d',
  },
  'retro-neon': {
    light: '#160d35',
    dark: '#09051c',
  },
}

function setThemeColorMeta(color: string) {
  let themeColorMeta = document.querySelector('meta[name="theme-color"]')

  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta')
    themeColorMeta.setAttribute('name', 'theme-color')
    document.head.append(themeColorMeta)
  }

  themeColorMeta.setAttribute('content', color)
}

function getFallbackThemeColor(palette: PaletteId, themeMode: ThemeMode) {
  return APP_BG_BASE_BY_THEME[palette][themeMode]
}

function resolveLiveThemeColor(palette: PaletteId, themeMode: ThemeMode) {
  const appRoot = document.querySelector('.app-root')

  if (appRoot) {
    const liveColor = window.getComputedStyle(appRoot).getPropertyValue('--app-bg-base').trim()

    if (liveColor) {
      return liveColor
    }
  }

  return getFallbackThemeColor(palette, themeMode)
}

function App() {
  const [palette, setPalette] = useState<PaletteId>(readStoredPalette)
  const [themeMode, setThemeMode] = useState<ThemeMode>(readStoredThemeMode)
  const [footerFirstLineBounds, setFooterFirstLineBounds] = useState<{ left: number; right: number } | null>(null)
  const footerCopyRef = useRef<HTMLParagraphElement | null>(null)
  const footerCopyTextRef = useRef<HTMLSpanElement | null>(null)
  const isDarkMode = themeMode === 'dark'

  const measureFooterFirstLine = useCallback(() => {
    const footerCopy = footerCopyRef.current
    const footerCopyText = footerCopyTextRef.current

    if (!footerCopy || !footerCopyText) {
      return
    }

    const lineRange = document.createRange()
    lineRange.selectNodeContents(footerCopyText)

    const textRects = Array.from(lineRange.getClientRects()).filter((rect) => rect.width > 0 && rect.height > 0)

    if (!textRects.length) {
      setFooterFirstLineBounds(null)
      return
    }

    const firstLineTop = Math.min(...textRects.map((rect) => rect.top))
    const firstLineRects = textRects.filter((rect) => Math.abs(rect.top - firstLineTop) <= 1)

    if (!firstLineRects.length) {
      setFooterFirstLineBounds(null)
      return
    }

    const footerRect = footerCopy.getBoundingClientRect()
    const measuredLeft = Math.min(...firstLineRects.map((rect) => rect.left)) - footerRect.left
    const measuredRight = Math.max(...firstLineRects.map((rect) => rect.right)) - footerRect.left
    const roundedLeft = Number(measuredLeft.toFixed(2))
    const roundedRight = Number(measuredRight.toFixed(2))

    setFooterFirstLineBounds((previousBounds) => {
      if (previousBounds && previousBounds.left === roundedLeft && previousBounds.right === roundedRight) {
        return previousBounds
      }

      return { left: roundedLeft, right: roundedRight }
    })
  }, [])

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEYS.palette, palette)
  }, [palette])

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEYS.dark, String(isDarkMode))
  }, [isDarkMode])

  useEffect(() => {
    setThemeColorMeta(resolveLiveThemeColor(palette, themeMode))
  }, [palette, themeMode])

  useLayoutEffect(() => {
    measureFooterFirstLine()

    const footerCopy = footerCopyRef.current

    if (!footerCopy) {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      measureFooterFirstLine()
    })

    resizeObserver.observe(footerCopy)
    window.addEventListener('resize', measureFooterFirstLine)
    document.fonts?.ready.then(() => {
      measureFooterFirstLine()
    }).catch(() => {
      // no-op: first-line bounds are already measured during layout
    })

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', measureFooterFirstLine)
    }
  }, [measureFooterFirstLine])

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
          <p ref={footerCopyRef} className="app-footer-copy">
            {footerFirstLineBounds && (
              <>
                <span
                  aria-hidden="true"
                  className="app-footer-palm app-footer-palm-left"
                  style={{ left: `${footerFirstLineBounds.left}px` }}
                >
                  🌴{'      '}
                </span>
                <span
                  aria-hidden="true"
                  className="app-footer-palm app-footer-palm-right"
                  style={{ left: `${footerFirstLineBounds.right}px` }}
                >
                  {'      '}🌴
                </span>
              </>
            )}
            <span ref={footerCopyTextRef}>
              Created by <a href="https://kerlinemoncy.com" target="_blank">Kerline Moncy</a> 2026
            </span>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
