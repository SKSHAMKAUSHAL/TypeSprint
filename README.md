# TypeSprint

High‑performance typing test (Monkeytype style) built with Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma.

## Features
# TypeSprint

TypeSprint is a high-performance typing test app inspired by Monkeytype. It provides a precise per-character typing experience, accurate WPM/accuracy stats, and a GPU-optimized caret that behaves smoothly across wrapped lines.

This repository is scaffolded with Next.js (App Router), React, TypeScript and Tailwind CSS and includes optional Prisma hooks for persisting results.

## Highlights

- Precise caret implemented using DOM measurements (no `<input/>`/`<textarea/>`), transform-based positioning and rAF to avoid jitter.
- Blink pause while typing and resumes after 500ms of inactivity.
- Character-level error tracking (Set-based) to avoid stale index bugs.
- Timed tests (30s / 60s / 90s / 120s) with single-click duration switching.
- Results modal with WPM chart (if chart deps are installed).

## Quick Start (Development)

1. Install dependencies

```powershell
npm install
```

2. Run dev server

```powershell
npm run dev
```

3. Open http://localhost:3000

Notes:

- If you see hydration warnings, ensure the app is running with `next dev` and that `targetText` is generated on the client only (the code already guards this).

## Production Build

```powershell
npm run build
npm start
```

For deploying to Vercel, simply connect your GitHub repo and set required environment variables (see Environment section).

## Environment Variables

Create `.env.local` (do NOT commit this file):

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NEXT_PUBLIC_SOME_KEY=...
```

If you are not using the database, you can leave `DATABASE_URL` empty.

## Folder Layout (important files)

- `app/` — Next.js App Router pages and layout.
- `components/game/TypingBoard.tsx` — main typing UI and caret logic.
- `hooks/useTypingGame.ts` — engine: user input, errors, timing, stats calculation.
- `components/game/ResultsModal.tsx` — post-test results UI.
- `prisma/` — Prisma schema and migrations (optional).
- `README.md` — this file.

## Cleanup Recommendations (before push)

- Ensure `.env` files are not committed.
- Remove unused features to slim the repo (if you don't want multiplayer):
	- `hooks/useMultiplayer.ts`
	- `components/game/RaceTrack.tsx`
	- `app/multiplayer/`
	- `MULTIPLAYER.md`
- Trim heavy charting or animation libs if you need smaller bundle size.

## Common Troubleshooting

- Permission errors deleting `.next` on Windows: stop node processes and retry or reboot.
- Caret misalignment: ensure fonts are loaded and there are no global letter-spacing/transform rules affecting the typing container.
- If `npm run dev` fails due to missing packages, run `npm install` and check `package.json` for required versions.

## Git / Deployment Example

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

Replace `USERNAME/REPO.git` with your repository URL.

## Removing Local Debug Helpers

The repository has a few transient debug attributes removed from production. If you see `data-` debug attributes in components, you can safely remove them before pushing.

## Contributing

If you want to extend or harden the project, consider:

- Migrating caret measurement to a single rAF loop for heavy tests.
- Adding accessibility improvements: ARIA live regions for WPM updates and keyboard controls.
- Adding unit tests for `useTypingGame` (simulate key events and timing).

## License

Choose a license for your project. This template does not include a license file by default.

---
If you'd like, I can now run the Git commands to initialize this repository and attempt to push it. Note: pushing requires your Git credentials to be available in this environment (you will be prompted if not). Tell me to proceed and I'll run the commands.
