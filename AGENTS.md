# IceBreaker 2000 Agent Notes

## Project
- Name: `IceBreaker 2000`
- Stack: React + Vite + TypeScript + raw CSS
- Package manager: `pnpm`
- PWA: `vite-plugin-pwa`
- Deploy target: Cloudflare Pages (`dist`)

## Commands
- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Preview: `pnpm preview`
- Type check: `pnpm typecheck`

## Architecture
- Entry: `src/main.tsx`, `src/App.tsx`
- Core behavior: `src/components/SlotMachine.tsx`
- UI components: `src/components/Reel.tsx`, `ModeToggle.tsx`, `SpinButton.tsx`
- Data:
  - `src/questions.json` (safe mode prompts)
  - `src/chaos.json` (chaos mode segments)
- Styling: `src/App.css` only

## Product Behavior
- `SAFE` mode is implemented:
  - Single reel spin
  - Fast-to-slow deceleration
  - Lands on one question
- `CHAOS` mode is scaffolded only:
  - 3 reels rendered (`Opener`, `Descriptor`, `Topic`)
  - Composition/spin logic intentionally left as TODO

## UI Constraints
- Mobile-first layout with large tap targets.
- Theme: deep red background, gold chrome borders, white/yellow text, green action button.
- Font: `Press Start 2P`.
