# IceBreaker 2000

IceBreaker 2000 is a static PWA that generates networking prompts with a Vegas slot-machine + Y2K aesthetic.

- Mode 1 (`SAFE`): fully implemented single-reel spin with deceleration that lands on one question.
- Mode 2 (`CHAOS`): UI scaffolded with 3 reels (`Opener`, `Descriptor`, `Topic`) and TODO logic stub.

## Tech Stack

- React + Vite
- TypeScript
- `pnpm`
- `vite-plugin-pwa`
- Raw CSS in `src/App.css` (no Tailwind)

## Quick Start

```bash
pnpm install
pnpm dev
```

Then open the local Vite URL shown in terminal.

## Build & Preview

```bash
pnpm build
pnpm preview
```

Optional type check:

```bash
pnpm typecheck
```

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
  questions.json
  chaos.json
  components/
    SlotMachine.tsx
    Reel.tsx
    SpinButton.tsx
    ModeToggle.tsx
```

## PWA Notes

- PWA is configured in `vite.config.ts` via `vite-plugin-pwa`.
- Manifest includes app metadata and icons in `public/`.
- Service worker registration is auto-injected for production builds.

## UX Notes

- Mobile-first layout with large tap targets for one-handed use.
- Help icon (`?`) instruction text:
  - `Spin to get a question. Ask it to a stranger.`
