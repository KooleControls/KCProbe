# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What is KCProbe?

KCProbe is an **internal, browser-based diagnostic tool** for the embedded
devices team at Koole Controls. Technical staff use it to test and troubleshoot
embedded devices by sending commands manually and inspecting responses. It is
**not** a general-purpose tool and is **internal use only**.

Devices speak a **proprietary TCP protocol**. Browsers can't open raw TCP
sockets, so KCProbe is split into two layers:

```
GitHub Pages (React + shadcn/ui)         ← the web app (UI, all business logic)
        ↕  chrome.runtime.sendMessage
Chrome Extension (TCP socket manager)    ← transport layer only
        ↕  raw TCP (proprietary protocol)
Embedded Device
```

- **Web app** — React + Vite + shadcn/ui, fully static, hosted on GitHub Pages,
  zero install. Detects whether the extension is installed and current; shows an
  install banner if missing, an update prompt if outdated, otherwise connects.
- **Chrome extension (Manifest V3)** — owns all TCP connections via
  `chrome.sockets.tcp` and exposes a generic messaging API. Distributed via
  GitHub Releases (unpacked or `.crx`), **not** the Chrome Web Store. Versioned;
  the web app checks the version on load.

## Current state of the repo

⚠️ **The repo today is only the web-app scaffold.** A fresh
Vite + React + shadcn/ui template lives at the repo **root** — the
`app/` + `extension/` split described below does not exist yet, and there is no
extension, TCP code, or device logic. `src/App.tsx` is still the starter page.

Treat the sections below as the intended design, not the existing structure.

## Tech stack (as actually installed)

| Concern | Choice |
|---|---|
| Package manager | **pnpm** (workspace configured, `packages: []`) |
| Framework | **React 19** |
| Language | **TypeScript ~6** |
| Build tool | **Vite 8** |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` (no `tailwind.config`; theme in `src/index.css`) |
| Components | **shadcn/ui** (style `radix-mira`, base color `neutral`), on `radix-ui` |
| Icons | **lucide-react** |
| Lint / format | ESLint 10 (flat config) + Prettier 3 (with `prettier-plugin-tailwindcss`) |

## Commands

```bash
pnpm dev         # start Vite dev server
pnpm build       # tsc -b && vite build
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint .
pnpm format      # prettier --write "**/*.{ts,tsx}"
pnpm preview     # preview the production build
```

Use **pnpm**, not npm/yarn.

## Conventions

- **Import alias:** `@/` → `src/` (configured in `vite.config.ts` and tsconfig).
  Use `@/components/ui/...`, `@/lib/utils`, `@/hooks`, etc.
- **Add shadcn components** with `pnpm dlx shadcn@latest add <name>` — they land
  in `src/components/ui`. Prefer shadcn/ui components over custom CSS.
- **Styling** is Tailwind v4 utility classes; merge with `cn()` from
  `@/lib/utils`. Theme tokens live in `src/index.css` (CSS variables).
- Match the existing formatting; run `pnpm format` and `pnpm lint` before
  finishing.

## Architecture principles (carry these into new code)

- **Keep the extension minimal** — it is a *transport layer*, not a business
  logic layer. All UI and command logic lives in the web app.
- **Design the extension messaging API to be generic.** It must support future
  device-specific components **without requiring extension changes**.
- **No backend, no Electron/Tauri/local service.** The extension is the only
  installable component; the web app is fully static.
- **Chrome only** is acceptable for this internal audience.

## Roadmap

- **Phase 1:** connect to a device by host + port over TCP, send raw commands,
  display responses, extension presence/version check with install/update prompts.
- **Phase 2:** *device-specific components* — pluggable UI panels for a given
  device type that automate multi-command workflows (e.g. a "Retrieve Logs"
  button firing several underlying commands in sequence). Design these as
  modular/pluggable from the start.

## Intended structure (once the split lands)

```
kcprobe/
├── app/          # React + Vite web app (deployed to GitHub Pages)
└── extension/    # Chrome extension (TCP driver)
```

A pnpm workspace is already initialized to accommodate this. When introducing
the split, move the current root scaffold into `app/` and add `app/` (and
`extension/` if it becomes a package) to `pnpm-workspace.yaml`.
