# IceBreaker 2000

IceBreaker 2000 is a slot-machine-style question generator for starting conversations.
Spin once, get a prompt, and use it as an icebreaker.

## How It Works

- `SAFE` mode
  - Spins one reel and lands on a complete question
  - Great when you want a straightforward conversation starter
- `CHAOS` mode
  - Spins three reels (`Opener`, `Descriptor`, `Topic`)
  - Combines them into one wild, random prompt
- Theme controls
  - Cycle visual palettes
  - Toggle light/dark mode

## Quick Start

```bash
pnpm install
pnpm dev
```

Then open the local URL shown in your terminal (usually `http://localhost:5173`).

Optional:

```bash
pnpm build
pnpm preview
```

## Tech Stack (For Curious Folks)

- React 19
- TypeScript
- Vite
- `pnpm`
- `vite-plugin-pwa`
- Raw CSS (no UI framework)
