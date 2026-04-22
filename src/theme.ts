export const PALETTE_IDS = ['art-deco', 'retro-neon', 'classic-vegas'] as const

export type PaletteId = (typeof PALETTE_IDS)[number]
export type ThemeMode = 'light' | 'dark'

export const DEFAULT_PALETTE: PaletteId = 'classic-vegas'
export const DEFAULT_THEME_MODE: ThemeMode = 'light'

export const THEME_STORAGE_KEYS = {
  palette: 'icebreaker.theme.palette',
  dark: 'icebreaker.theme.dark',
} as const

export function isPaletteId(value: string): value is PaletteId {
  return (PALETTE_IDS as readonly string[]).includes(value)
}

export function readStoredPalette(): PaletteId {
  if (typeof window === 'undefined') {
    return DEFAULT_PALETTE
  }

  const storedPalette = window.localStorage.getItem(THEME_STORAGE_KEYS.palette)
  return storedPalette && isPaletteId(storedPalette)
    ? storedPalette
    : DEFAULT_PALETTE
}

export function readStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_MODE
  }

  const storedDark = window.localStorage.getItem(THEME_STORAGE_KEYS.dark)
  return storedDark === 'true' ? 'dark' : DEFAULT_THEME_MODE
}
