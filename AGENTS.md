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
- Lint: `pnpm lint`
- Type check: `pnpm typecheck`
- Prepare hooks: `pnpm prepare`
- Pre-commit quality gate (`.husky/pre-commit`): `pnpm lint` then `pnpm build`

## Architecture
- Entry: `src/main.tsx`, `src/App.tsx`
- Core behavior: `src/components/SlotMachine.tsx`
- UI components: `src/components/Reel.tsx`, `ModeToggle.tsx`, `SpinButton.tsx`, `ThemeControls.tsx`
- Theme and persistence: `src/theme.ts` (`localStorage` palette + theme mode keys)
- Data:
  - `src/questions.json` (safe mode prompts)
  - `src/chaos.json` (chaos mode segments)
- Styling: `src/App.css` only

## Product Behavior
- `SAFE` mode is implemented:
  - Single reel spin
  - Fast-to-slow deceleration
  - Lands on one question
- `CHAOS` mode is implemented:
  - 3 reels (`Opener`, `Descriptor`, `Topic`) spin independently
  - Per-reel timeout/state management with staggered stop timing
  - Final display composes opener + descriptor + topic into one prompt

## UI Constraints
- Mobile-first layout with large tap targets.
- Theme system supports palette cycling + light/dark mode.
- Palettes: `classic-vegas`, `art-deco`, `retro-neon`.
- Font: `Press Start 2P`.
