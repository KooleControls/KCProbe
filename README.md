# KCProbe

Internal browser-based diagnostic tool for the Koole Controls embedded devices
team. Used by technical staff to test and troubleshoot embedded devices by
sending commands and inspecting responses.

Devices speak a proprietary TCP protocol. Since browsers can't open raw TCP
sockets, KCProbe is split into two layers:

```
GitHub Pages (this web app)              ← UI + all logic
        ↕  chrome.runtime.sendMessage
Chrome Extension (TCP socket manager)    ← transport only
        ↕  raw TCP (proprietary protocol)
Embedded Device
```

See [CLAUDE.md](CLAUDE.md) for the full architecture and roadmap.

## Structure

A pnpm monorepo with two packages:

- **[app/](app/)** — the React + Vite web app (`@kcprobe/app`), deployed to GitHub Pages.
- **[extension/](extension/)** — the Chrome MV3 extension (`@kcprobe/extension`),
  the TCP transport layer. No build step; load it unpacked. See
  [extension/README.md](extension/README.md).

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui · pnpm

## Development

Run from the repo root:

```bash
pnpm install
pnpm dev         # start the app dev server (@kcprobe/app)
pnpm build       # build all packages
pnpm typecheck   # tsc --noEmit across packages
pnpm lint        # eslint across packages
pnpm format      # prettier across the repo
```

Add shadcn/ui components from inside `app/`:

```bash
cd app && pnpm dlx shadcn@latest add <component>
```

They are placed in `app/src/components/ui` and imported via the `@/` alias, e.g.
`import { Button } from "@/components/ui/button"`.
