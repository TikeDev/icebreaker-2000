import { expect, test, type Page } from '@playwright/test'

const MIN_READABLE_SIZE_PX = 14

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 },
] as const

const MODES = ['safe', 'chaos'] as const
const THEMES = ['light', 'dark'] as const
const PALETTES = ['classic-vegas', 'art-deco', 'retro-neon'] as const

const READABILITY_SELECTORS = [
  '.title-kicker',
  '.title-subtitle',
  '.mode-toggle',
  '.theme-cycle-button',
  '.reel-label',
  '.reel-list li',
  '.question-display',
] as const

type SlotMode = (typeof MODES)[number]
type ThemeMode = (typeof THEMES)[number]
type Palette = (typeof PALETTES)[number]

async function getRootDataAttribute(page: Page, attributeName: string) {
  return page.locator('.app-root').evaluate((el, attrName) => el.getAttribute(attrName), attributeName)
}

async function setPalette(page: Page, targetPalette: Palette) {
  const cycleButton = page.getByRole('button', { name: /Cycle palette/i })

  for (let i = 0; i < PALETTES.length + 1; i += 1) {
    const currentPalette = await getRootDataAttribute(page, 'data-palette')
    if (currentPalette === targetPalette) {
      return
    }

    await cycleButton.click()
  }

  throw new Error(`Unable to set palette to ${targetPalette}`)
}

async function setTheme(page: Page, targetTheme: ThemeMode) {
  const themeToggle = page.locator('.theme-icon-toggle')

  for (let i = 0; i < 3; i += 1) {
    const currentTheme = await getRootDataAttribute(page, 'data-theme-mode')
    if (currentTheme === targetTheme) {
      return
    }

    await themeToggle.click()
  }

  throw new Error(`Unable to set theme to ${targetTheme}`)
}

async function currentMode(page: Page): Promise<SlotMode> {
  const modeLabel = await page.locator('.mode-toggle').evaluate((el) => {
    const buttonText = (el.textContent ?? '').replace(/\s+/g, ' ').trim()
    const match = buttonText.match(/:\s*(SAFE|CHAOS)$/i)
    return match?.[1]?.toLowerCase() ?? ''
  })

  return modeLabel === 'chaos' ? 'chaos' : 'safe'
}

async function setMode(page: Page, targetMode: SlotMode) {
  const modeButton = page.locator('.mode-toggle')

  for (let i = 0; i < 3; i += 1) {
    if ((await currentMode(page)) === targetMode) {
      return
    }

    await modeButton.click()
  }

  throw new Error(`Unable to set mode to ${targetMode}`)
}

async function setHelpPopoverVisibility(page: Page, shouldBeVisible: boolean) {
  const popover = page.locator('.help-popover')
  const helpToggle = page.locator('.help-button')

  await expect(helpToggle).toBeVisible()

  const isExpanded = (await helpToggle.getAttribute('aria-expanded')) === 'true'
  if (isExpanded !== shouldBeVisible) {
    await helpToggle.click()
  }

  if (shouldBeVisible) {
    await expect(popover).toBeVisible()
  } else {
    await expect(popover).toBeHidden()
  }
}

async function assertMinimumReadableFontSize(page: Page, context: string) {
  const result = await page.evaluate(
    ({ selectors, minSize }) => {
      const isVisible = (element: Element) => {
        const htmlElement = element as HTMLElement
        const style = window.getComputedStyle(htmlElement)
        const rect = htmlElement.getBoundingClientRect()

        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          rect.width > 0 &&
          rect.height > 0
        )
      }

      const missingSelectors: string[] = []
      const violations: Array<{
        selector: string
        fontSizePx: number
        tag: string
        className: string
        text: string
      }> = []

      for (const selector of selectors) {
        const matchedElements = Array.from(document.querySelectorAll(selector))

        if (matchedElements.length === 0) {
          missingSelectors.push(selector)
          continue
        }

        for (const element of matchedElements) {
          if (!isVisible(element)) {
            continue
          }

          const htmlElement = element as HTMLElement
          const computedSize = Number.parseFloat(window.getComputedStyle(htmlElement).fontSize)

          if (computedSize < minSize) {
            violations.push({
              selector,
              fontSizePx: Number(computedSize.toFixed(2)),
              tag: htmlElement.tagName.toLowerCase(),
              className: htmlElement.className,
              text: (htmlElement.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 80),
            })
          }
        }
      }

      return {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          scale: window.visualViewport?.scale ?? 1,
        },
        missingSelectors,
        violations,
      }
    },
    { selectors: READABILITY_SELECTORS, minSize: MIN_READABLE_SIZE_PX },
  )

  expect(
    result.viewport.scale,
    `${context}: expected browser zoom scale to remain 1 (100%), got ${result.viewport.scale}`,
  ).toBe(1)

  expect(
    result.missingSelectors,
    `${context}: expected all readability selectors to exist in the DOM`,
  ).toEqual([])

  expect(
    result.violations,
    `${context}: found text below ${MIN_READABLE_SIZE_PX}px\n${JSON.stringify(result.violations, null, 2)}`,
  ).toEqual([])
}

async function assertHelpPopoverReadable(page: Page, context: string) {
  await setHelpPopoverVisibility(page, true)

  await assertMinimumReadableFontSize(
    page,
    `${context} / help-popover-open`,
  )

  const popoverResult = await page.evaluate(() => {
    const popover = document.querySelector('.help-popover') as HTMLElement | null
    if (!popover) {
      return { exists: false, fontSizePx: 0 }
    }

    const computedSize = Number.parseFloat(window.getComputedStyle(popover).fontSize)
    return {
      exists: true,
      fontSizePx: Number(computedSize.toFixed(2)),
    }
  })

  expect(popoverResult.exists, `${context}: expected help popover to exist`).toBe(true)
  expect(
    popoverResult.fontSizePx,
    `${context}: help popover text is below ${MIN_READABLE_SIZE_PX}px`,
  ).toBeGreaterThanOrEqual(MIN_READABLE_SIZE_PX)

  await setHelpPopoverVisibility(page, false)
}

test('keeps non-decorative text readable at 100% zoom across UI states', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear()
  })

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')

    await expect(page.locator('.app-root')).toBeVisible()
    await setHelpPopoverVisibility(page, false)

    for (const mode of MODES) {
      await setMode(page, mode)

      for (const theme of THEMES) {
        await setTheme(page, theme)

        for (const palette of PALETTES) {
          await setPalette(page, palette)
          const context = `${viewport.name} / ${mode} / ${theme} / ${palette}`
          await assertMinimumReadableFontSize(page, context)
          await assertHelpPopoverReadable(page, context)
        }
      }
    }
  }
})
