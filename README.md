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

> The Chrome extension does not exist in this repo yet — this is currently the
> web-app scaffold only. See [CLAUDE.md](CLAUDE.md) for the full architecture
> and roadmap.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui · pnpm

## Development

```bash
pnpm install
pnpm dev         # start the dev server
pnpm build       # type-check and build for production
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint
pnpm format      # prettier
```

Add shadcn/ui components with:

```bash
pnpm dlx shadcn@latest add <component>
```

They are placed in `src/components/ui` and imported via the `@/` alias, e.g.
`import { Button } from "@/components/ui/button"`.
