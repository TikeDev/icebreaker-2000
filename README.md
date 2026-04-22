# IceBreaker 2000

IceBreaker 2000 is a static PWA that generates networking prompts with a Vegas slot-machine + Y2K aesthetic.

- `SAFE` mode is fully implemented as a single-reel spin that decelerates and lands on one question.
- `CHAOS` mode is fully implemented with 3 independent reels (`Opener`, `Descriptor`, `Topic`) that stop in sequence and compose one prompt.
- Theme controls are implemented with palette cycling and light/dark mode.

## Tech Stack

- React + Vite
- TypeScript
- `pnpm`
- `vite-plugin-pwa`
- Raw CSS in `src/App.css` (no Tailwind)

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm typecheck
pnpm prepare
```

`pnpm prepare` installs Husky hooks for local git workflows.

## Modes

- `SAFE`
  - Single reel (`questions.json`)
  - Fast-to-slow deceleration until final question
- `CHAOS`
  - Three reels (`openers`, `descriptors`, `topics` from `chaos.json`)
  - Independent spin state and timeout handling per reel
  - Staggered stop timing with composed final display text

## Theme System

- Palettes: `classic-vegas`, `art-deco`, `retro-neon`
- Light/dark mode toggle
- Palette and theme mode are persisted in `localStorage`
- Main files:
  - `src/components/ThemeControls.tsx`
  - `src/theme.ts`

## Cloudflare Pages Deploy

- Framework preset: `Vite`
- Build command: `pnpm build`
- Build output directory: `dist`
- Node version: use current LTS (Cloudflare default is fine for this project)

## Project Structure

```text
src/
  App.tsx
  App.css
  main.tsx
  theme.ts
  questions.json
  chaos.json
  components/
    SlotMachine.tsx
    Reel.tsx
    SpinButton.tsx
    ModeToggle.tsx
    ThemeControls.tsx
```

## PWA Notes

- PWA is configured in `vite.config.ts` via `vite-plugin-pwa`.
- Registration is configured with `registerType: 'autoUpdate'` and `injectRegister: 'auto'`.
- Manifest metadata and icons are defined in `vite.config.ts` and sourced from `public/`.
- Build output includes generated service worker assets in `dist/`.

## Quality Gates

- Husky pre-commit hook runs:
  - `pnpm lint`
  - `pnpm build`
- Hook script location: `.husky/pre-commit`

## UX Notes

- Mobile-first layout with large tap targets for one-handed use.
- Help icon (`?`) instruction text:
  - `Spin to get a question. Ask it to a stranger.`
