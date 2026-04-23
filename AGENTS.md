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
- Readability audit: `pnpm a11y:readability`
- Type check: `pnpm typecheck`
- Prepare hooks: `pnpm prepare`
- Pre-commit quality gate (`.husky/pre-commit`): `pnpm lint`, `pnpm build`, `pnpm a11y:readability`

## Architecture
- Entry: `src/main.tsx`, `src/App.tsx`
- Core behavior: `src/components/SlotMachine.tsx`
- UI components: `src/components/Reel.tsx`, `ModeToggle.tsx`, `SpinButton.tsx`, `ThemeControls.tsx`
- Theme and persistence: `src/theme.ts` (`localStorage` palette + theme mode keys)
- Data:
  - `src/questions.json` (safe mode prompts)
  - `src/chaos.json` (chaos mode segments)
- Styling: `src/App.css` only
- Runtime/readability test anchors:
  - Playwright config: `playwright.readability.config.ts`
  - Readability spec: `tests/readability/min-font-size.spec.ts`
- PWA config: `vite.config.ts` (`VitePWA` manifest + auto-update registration)

## Product Behavior
- `SAFE` mode is implemented:
  - Single reel spin
  - Fast-to-slow deceleration
  - Lands on one question
- `CHAOS` mode is implemented:
  - 3 reels (`Opener`, `Descriptor`, `Topic`) spin independently
  - Per-reel timeout/state management with staggered stop timing
  - Final display composes opener + descriptor + topic into one prompt
- UX/accessibility behavior:
  - Help popover flow is implemented in slot controls (`?` toggle with ARIA expanded/controls linkage).
  - Reduced-motion preference is implemented (shorter spin duration, stagger, and travel distance).
  - Result text is surfaced through a live status region (`.question-display` with `role="status"` and `aria-live="polite"`).

## UI Constraints
- Mobile-first layout with large tap targets.
- Theme system supports palette cycling + light/dark mode.
- Palettes: `classic-vegas`, `art-deco`, `retro-neon`.
- Font: `Press Start 2P`.
