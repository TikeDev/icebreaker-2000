import { defineConfig } from '@playwright/test'

const chromeBetaPath =
  '/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta'

export default defineConfig({
  testDir: './tests/readability',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 180000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    launchOptions: {
      executablePath: chromeBetaPath,
    },
  },
  webServer: {
    command: 'pnpm dev --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 120000,
  },
})
