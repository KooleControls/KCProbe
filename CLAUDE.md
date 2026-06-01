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
- **Chrome extension (Manifest V3)** — owns all TCP connections and exposes a
  generic messaging API. Distributed via GitHub Releases (unpacked or `.crx`),
  **not** the Chrome Web Store. Versioned; the web app checks the version on load.

  ⚠️ The classic `chrome.sockets.tcp` API is a Chrome **Apps** API and is **not**
  available to MV3 extensions. The actual raw-TCP mechanism (Direct Sockets API
  in an Isolated Web App, a native-messaging host, etc.) is an **open decision** —
  the extension currently only implements the presence/version handshake.

## Repo structure

A **pnpm monorepo** with two packages:

```
kcprobe/
├── app/            # @kcprobe/app — React + Vite web app → GitHub Pages
│   ├── src/        #   App.tsx, components/ (incl. ui/ from shadcn), lib/
│   ├── index.html
│   └── vite.config.ts, tsconfig*.json, components.json, eslint.config.js
├── extension/      # @kcprobe/extension — Chrome MV3 TCP driver (no build step)
│   ├── manifest.json
│   └── src/background.js   # service worker; generic message API
├── package.json    # root: workspace orchestration scripts + shared prettier
├── pnpm-workspace.yaml
└── .prettierrc     # shared formatting config (repo-wide)
```

There is **no shared package** for the message contract yet; the app and
extension each define the message types until duplication justifies extracting a
`packages/protocol`.

## Current state

Phase 1 is **not built yet**. The web app is a near-empty shell
([app/src/App.tsx](app/src/App.tsx) is just a header) and the extension only
answers the presence/version ping (`KCPROBE_PING` → `KCPROBE_PONG`). No TCP
connect/send/disconnect, no device logic, no extension-detection UI yet.

## Tech stack (as actually installed)

| Concern         | Choice                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------- |
| Package manager | **pnpm** workspace (`app`, `extension`)                                                      |
| Framework       | **React 19**                                                                                 |
| Language        | **TypeScript ~6**                                                                            |
| Build tool      | **Vite 8**                                                                                   |
| Styling         | **Tailwind CSS v4** via `@tailwindcss/vite` (no `tailwind.config`; theme in `src/index.css`) |
| Components      | **shadcn/ui** (style `radix-mira`, base color `neutral`), on `radix-ui`                      |
| Icons           | **lucide-react**                                                                             |
| Lint / format   | ESLint 10 (flat config) + Prettier 3 (with `prettier-plugin-tailwindcss`)                    |

## Commands

Run from the repo **root** (scripts fan out across packages with `pnpm -r`):

```bash
pnpm install     # install all workspace deps
pnpm dev         # start the app's Vite dev server (@kcprobe/app)
pnpm build       # build every package that has a build script
pnpm typecheck   # tsc --noEmit across packages
pnpm lint        # eslint across packages
pnpm format      # prettier across the whole repo
```

Target one package directly with a filter, e.g.
`pnpm --filter @kcprobe/app dev`. Use **pnpm**, not npm/yarn.

The **extension has no build step** — load `extension/` unpacked via
`chrome://extensions` (Developer mode → Load unpacked). See
[extension/README.md](extension/README.md).

## Conventions

- **Import alias (app only):** `@/` → `app/src/` (configured in
  `app/vite.config.ts` and tsconfig). Use `@/components/ui/...`, `@/lib/utils`,
  `@/hooks`, etc.
- **Add shadcn components** by running `pnpm dlx shadcn@latest add <name>` **from
  inside `app/`** — they land in `app/src/components/ui`. Prefer shadcn/ui
  components over custom CSS.
- **Styling** is Tailwind v4 utility classes; merge with `cn()` from
  `@/lib/utils`. Theme tokens live in `app/src/index.css` (CSS variables).
- Prettier config is shared at the repo root (`.prettierrc`); run `pnpm format`
  and `pnpm lint` before finishing.

## Architecture principles (carry these into new code)

- **Keep the extension minimal** — it is a _transport layer_, not a business
  logic layer. All UI and command logic lives in the web app.
- **Design the extension messaging API to be generic.** It must support future
  device-specific components **without requiring extension changes**.
- **No backend, no Electron/Tauri/local service.** The extension is the only
  installable component; the web app is fully static.
- **Chrome only** is acceptable for this internal audience.

## Roadmap

- **Phase 1:** connect to a device by host + port over TCP, send raw commands,
  display responses, extension presence/version check with install/update prompts.
- **Phase 2:** _device-specific components_ — pluggable UI panels for a given
  device type that automate multi-command workflows (e.g. a "Retrieve Logs"
  button firing several underlying commands in sequence). Design these as
  modular/pluggable from the start.
